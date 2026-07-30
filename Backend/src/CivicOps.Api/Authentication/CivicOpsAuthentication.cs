using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace CivicOps.Api.Authentication;

internal static class CivicOpsClaimTypes
{
    public const string TenantId = "tenant_id";
    public const string UserId = "sub";
}

internal sealed class CivicOpsAuthenticationOptions
{
    public bool Enabled { get; set; } = true;

    public string Authority { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    public string? MetadataAddress { get; set; }

    public string? Issuer { get; set; }

    public bool RequireHttpsMetadata { get; set; } = true;
}

internal static class CivicOpsAuthenticationExtensions
{
    private const string TrustedHeadersScheme = "TrustedHeaders";
    private const string TenantHeader = "X-Tenant-Id";
    private const string UserHeader = "X-User-Id";

    public static IServiceCollection AddCivicOpsAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var options = configuration
            .GetSection("Authentication")
            .Get<CivicOpsAuthenticationOptions>()
            ?? new CivicOpsAuthenticationOptions();

        services.AddSingleton(options);

        if (options.Enabled)
        {
            if (string.IsNullOrWhiteSpace(options.Authority) ||
                string.IsNullOrWhiteSpace(options.Audience))
            {
                throw new InvalidOperationException(
                    "Authentication:Authority e Authentication:Audience são obrigatórios.");
            }

            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(jwt =>
                {
                    jwt.Authority = options.Authority;
                    jwt.Audience = options.Audience;
                    jwt.RequireHttpsMetadata = options.RequireHttpsMetadata;
                    jwt.MapInboundClaims = false;

                    if (!string.IsNullOrWhiteSpace(options.MetadataAddress))
                    {
                        jwt.MetadataAddress = options.MetadataAddress;
                    }

                    jwt.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = "preferred_username",
                        ValidIssuer = string.IsNullOrWhiteSpace(options.Issuer)
                            ? options.Authority.TrimEnd('/')
                            : options.Issuer
                    };
                });
        }
        else
        {
            services
                .AddAuthentication(TrustedHeadersScheme)
                .AddScheme<AuthenticationSchemeOptions, TrustedHeaderHandler>(
                    TrustedHeadersScheme,
                    _ => { });
        }

        services.AddAuthorization(authorization =>
        {
            authorization.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });

        return services;
    }

    public static IApplicationBuilder UseCivicOpsClaimsContext(
        this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            if (!context.Request.Path.StartsWithSegments("/api"))
            {
                await next(context);
                return;
            }

            var options = context.RequestServices
                .GetRequiredService<CivicOpsAuthenticationOptions>();

            if (context.User.Identity?.IsAuthenticated != true)
            {
                await next(context);
                return;
            }

            var tenantClaim = context.User.FindFirstValue(
                CivicOpsClaimTypes.TenantId);
            var userClaim = context.User.FindFirstValue(
                CivicOpsClaimTypes.UserId);

            context.Request.Headers.Remove(TenantHeader);
            context.Request.Headers.Remove(UserHeader);

            if (TryParseRequiredId(tenantClaim, out var tenantId) &&
                TryParseRequiredId(userClaim, out var userId))
            {
                context.Request.Headers[TenantHeader] = tenantId.ToString();
                context.Request.Headers[UserHeader] = userId.ToString();
                await next(context);
                return;
            }

            if (!options.Enabled)
            {
                await next(context);
                return;
            }

            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                type = "https://httpstatuses.com/403",
                title = "Identidade incompleta",
                status = StatusCodes.Status403Forbidden,
                detail =
                    "O token autenticado deve conter os claims sub e tenant_id como UUIDs válidos."
            });
        });
    }

    private static bool TryParseRequiredId(string? value, out Guid id)
    {
        return Guid.TryParse(value, out id) && id != Guid.Empty;
    }

    private sealed class TrustedHeaderHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : AuthenticationHandler<AuthenticationSchemeOptions>(
            options,
            logger,
            encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new List<Claim>();
            AddClaimIfValid(TenantHeader, CivicOpsClaimTypes.TenantId, claims);
            AddClaimIfValid(UserHeader, CivicOpsClaimTypes.UserId, claims);

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }

        private void AddClaimIfValid(
            string header,
            string claimType,
            ICollection<Claim> claims)
        {
            var value = Request.Headers[header].ToString();
            if (TryParseRequiredId(value, out var id))
            {
                claims.Add(new Claim(claimType, id.ToString()));
            }
        }
    }
}

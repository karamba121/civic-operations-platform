using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Keycloak;

internal sealed class KeycloakManagedIdentityProvider(
    HttpClient httpClient,
    KeycloakAdministrationOptions options)
    : IManagedIdentityProvider
{
    public async Task<ProvisionedIdentity> CreateAsync(
        ProvisionIdentityRequest request,
        CancellationToken cancellationToken)
    {
        EnsureEnabled();
        var token = await GetAdminTokenAsync(cancellationToken);
        using var message = new HttpRequestMessage(
            HttpMethod.Post,
            $"admin/realms/{Uri.EscapeDataString(options.Realm)}/users");
        message.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        message.Content = JsonContent.Create(
            CreateRepresentation(request));

        using var response = await httpClient.SendAsync(
            message,
            cancellationToken);

        if (response.StatusCode == HttpStatusCode.Conflict)
        {
            throw new ManagedIdentityConflictException(
                "O login ou e-mail informado já existe no provedor.");
        }

        response.EnsureSuccessStatusCode();
        var location = response.Headers.Location?.ToString();
        var idText = location?
            .TrimEnd('/')
            .Split('/')
            .LastOrDefault();

        if (!Guid.TryParse(idText, out var userId) ||
            userId == Guid.Empty)
        {
            throw new InvalidOperationException(
                "O provedor não retornou o identificador do usuário criado.");
        }

        return new ProvisionedIdentity(userId);
    }

    public async Task DeleteAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        EnsureEnabled();
        var token = await GetAdminTokenAsync(cancellationToken);
        using var message = new HttpRequestMessage(
            HttpMethod.Delete,
            $"admin/realms/{Uri.EscapeDataString(options.Realm)}/users/" +
            userId);
        message.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        using var response = await httpClient.SendAsync(
            message,
            cancellationToken);

        if (response.StatusCode != HttpStatusCode.NotFound)
        {
            response.EnsureSuccessStatusCode();
        }
    }

    private async Task<string> GetAdminTokenAsync(
        CancellationToken cancellationToken)
    {
        using var content = new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["client_id"] = "admin-cli",
                ["grant_type"] = "password",
                ["username"] = options.AdminUsername,
                ["password"] = options.AdminPassword
            });
        using var response = await httpClient.PostAsync(
            $"realms/{Uri.EscapeDataString(options.AdminRealm)}" +
            "/protocol/openid-connect/token",
            content,
            cancellationToken);
        response.EnsureSuccessStatusCode();

        var token = await response.Content
            .ReadFromJsonAsync<AccessTokenResponse>(
                cancellationToken: cancellationToken);

        return token?.AccessToken
            ?? throw new InvalidOperationException(
                "O provedor não retornou um token administrativo.");
    }

    private static object CreateRepresentation(
        ProvisionIdentityRequest request)
    {
        var nameParts = request.DisplayName
            .Trim()
            .Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        var attributes = new Dictionary<string, string[]>
        {
            ["platform_admin"] =
            [
                request.IsPlatformAdministrator ? "true" : "false"
            ]
        };

        if (request.TenantId.HasValue)
        {
            attributes["tenant_id"] =
                [request.TenantId.Value.ToString()];
            attributes["tenant_name"] =
                [request.TenantName ?? "Tenant"];
        }

        return new
        {
            username = request.Username.Trim().ToLowerInvariant(),
            enabled = true,
            emailVerified = true,
            email = request.Email.Trim().ToLowerInvariant(),
            firstName = nameParts[0],
            lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            attributes,
            credentials = new[]
            {
                new
                {
                    type = "password",
                    value = request.Password,
                    temporary = false
                }
            }
        };
    }

    private void EnsureEnabled()
    {
        if (!options.Enabled)
        {
            throw new InvalidOperationException(
                "O provisionamento de identidades está desabilitado.");
        }
    }

    private sealed record AccessTokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken);
}

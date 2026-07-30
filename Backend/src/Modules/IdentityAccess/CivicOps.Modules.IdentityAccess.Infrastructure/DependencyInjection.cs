using CivicOps.Modules.IdentityAccess.Infrastructure.Keycloak;
using CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace CivicOps.Modules.IdentityAccess.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityAccessModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString =
            configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException(
                "A connection string 'Postgres' não foi configurada.");

        services.AddDbContext<IdentityAccessDbContext>(
            options => options.UseNpgsql(
                connectionString,
                npgsql => npgsql.MigrationsHistoryTable(
                    "__ef_migrations_history",
                    "identity_access")));
        services.AddScoped<
            ITenantMembershipRepository,
            TenantMembershipRepository>();
        services.AddScoped<ITenantRepository, TenantRepository>();
        services.AddScoped<IManagedUserRepository, ManagedUserRepository>();
        services.AddScoped<
            IIdentityAccessUnitOfWork,
            IdentityAccessUnitOfWork>();
        services.AddScoped<
            IIdentityAccessAuditWriter,
            IdentityAccessAuditWriter>();
        services.AddScoped<
            IPlatformAdministrationAuditWriter,
            PlatformAdministrationAuditWriter>();
        services.AddScoped<IPermissionAuthorizer, PermissionAuthorizer>();
        services.AddScoped<BootstrapTenantAdministratorHandler>();
        services.AddScoped<SetTenantMemberRoleHandler>();
        services.AddScoped<ListTenantMembersHandler>();
        services.AddScoped<CreateTenantHandler>();
        services.AddScoped<ListTenantsHandler>();
        services.AddScoped<CreatePlatformAdministratorHandler>();
        services.AddScoped<ListPlatformAdministratorsHandler>();
        services.AddScoped<CreateTenantUserHandler>();
        services.AddScoped<ListTenantUsersHandler>();
        services.AddSingleton(
            serviceProvider =>
                new IdentityAccessOptions(
                    serviceProvider
                        .GetRequiredService<IConfiguration>()
                        .GetValue<bool>(
                            "IdentityAccess:BootstrapEnabled")));
        var keycloakOptions = CreateKeycloakOptions(configuration);
        services.AddSingleton(keycloakOptions);
        services.AddHttpClient<IManagedIdentityProvider,
            KeycloakManagedIdentityProvider>(client =>
            {
                client.BaseAddress = new Uri(
                    keycloakOptions.BaseUrl.TrimEnd('/') + "/");
                client.Timeout = TimeSpan.FromSeconds(15);
            });
        services.TryAddSingleton(TimeProvider.System);

        return services;
    }

    private static KeycloakAdministrationOptions CreateKeycloakOptions(
        IConfiguration configuration)
    {
        var options = new KeycloakAdministrationOptions();
        configuration.GetSection("KeycloakAdministration").Bind(options);

        if (string.IsNullOrWhiteSpace(options.BaseUrl))
        {
            options.BaseUrl = "http://localhost:8081/auth";
        }

        if (options.Enabled &&
            (string.IsNullOrWhiteSpace(options.AdminUsername) ||
             string.IsNullOrWhiteSpace(options.AdminPassword) ||
             string.IsNullOrWhiteSpace(options.Realm)))
        {
            throw new InvalidOperationException(
                "A configuração administrativa do Keycloak está incompleta.");
        }

        return options;
    }
    public static async Task ApplyIdentityAccessMigrationsAsync(
        this IServiceProvider serviceProvider)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var dbContext = scope.ServiceProvider
            .GetRequiredService<IdentityAccessDbContext>();
        await dbContext.Database.MigrateAsync();
    }
}

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
        services.AddScoped<
            IIdentityAccessUnitOfWork,
            IdentityAccessUnitOfWork>();
        services.AddScoped<
            IIdentityAccessAuditWriter,
            IdentityAccessAuditWriter>();
        services.AddScoped<IPermissionAuthorizer, PermissionAuthorizer>();
        services.AddScoped<BootstrapTenantAdministratorHandler>();
        services.AddScoped<SetTenantMemberRoleHandler>();
        services.AddScoped<ListTenantMembersHandler>();
        services.AddSingleton(
            serviceProvider =>
                new IdentityAccessOptions(
                    serviceProvider
                        .GetRequiredService<IConfiguration>()
                        .GetValue<bool>(
                            "IdentityAccess:BootstrapEnabled")));
        services.TryAddSingleton(TimeProvider.System);

        return services;
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

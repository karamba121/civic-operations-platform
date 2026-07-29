using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.CreateRequest;
using CivicOps.Modules.Requests.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CivicOps.Modules.Requests.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddRequestsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException(
                "A connection string 'Postgres' não foi configurada.");

        services.AddDbContext<RequestsDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable(
                    "__ef_migrations_history",
                    "requests")));

        services.AddScoped<IRequestRepository, RequestRepository>();
        services.AddScoped<IProtocolNumberGenerator, PostgresProtocolNumberGenerator>();
        services.AddScoped<IRequestIdempotencyStore, PostgresRequestIdempotencyStore>();
        services.AddScoped<IRequestsUnitOfWork, RequestsUnitOfWork>();
        services.AddScoped<CreateRequestHandler>();
        services.AddSingleton(TimeProvider.System);

        return services;
    }

    public static async Task ApplyRequestsMigrationsAsync(
        this IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<RequestsDbContext>();
        await dbContext.Database.MigrateAsync(cancellationToken);
    }
}

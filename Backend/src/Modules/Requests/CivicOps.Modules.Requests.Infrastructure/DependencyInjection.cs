using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.AssignResponsible;
using CivicOps.Modules.Requests.Application.AddRequestComment;
using CivicOps.Modules.Requests.Application.ChangeRequestStatus;
using CivicOps.Modules.Requests.Application.CreateRequest;
using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.ListRequests;
using CivicOps.Modules.Requests.Application.ListRequestComments;
using CivicOps.Modules.Requests.Application.ListRequestAudit;
using CivicOps.Modules.Requests.Application.SetRequestDueDate;
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
        services.AddScoped<IRequestCommentRepository, RequestCommentRepository>();
        services.AddScoped<IRequestReadService, EfRequestReadService>();
        services.AddScoped<IProtocolNumberGenerator, PostgresProtocolNumberGenerator>();
        services.AddScoped<IRequestIdempotencyStore, PostgresRequestIdempotencyStore>();
        services.AddScoped<IRequestsUnitOfWork, RequestsUnitOfWork>();
        services.AddScoped<CreateRequestHandler>();
        services.AddScoped<AssignResponsibleHandler>();
        services.AddScoped<ChangeRequestStatusHandler>();
        services.AddScoped<SetRequestDueDateHandler>();
        services.AddScoped<AddRequestCommentHandler>();
        services.AddScoped<ListRequestCommentsHandler>();
        services.AddScoped<ListRequestAuditHandler>();
        services.AddScoped<ListRequestsHandler>();
        services.AddScoped<GetRequestDetailsHandler>();
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

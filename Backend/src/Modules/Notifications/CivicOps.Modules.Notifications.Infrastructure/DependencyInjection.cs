using CivicOps.Modules.Notifications.Application.Abstractions;
using CivicOps.Modules.Notifications.Application.ListNotifications;
using CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;
using CivicOps.Modules.Notifications.Infrastructure.Messaging;
using CivicOps.Modules.Notifications.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CivicOps.Modules.Notifications.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddNotificationsModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException(
                "A connection string 'Postgres' não foi configurada.");
        services.AddDbContext<NotificationsDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                npgsqlOptions => npgsqlOptions.MigrationsHistoryTable(
                    "__ef_migrations_history",
                    "notifications")));
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IProcessedMessageStore, PostgresProcessedMessageStore>();
        services.AddScoped<INotificationsUnitOfWork, NotificationsUnitOfWork>();
        services.AddScoped<INotificationReadService, EfNotificationReadService>();
        services.AddScoped<ProcessRequestAssignedHandler>();
        services.AddScoped<ListNotificationsHandler>();
        services.AddSingleton(serviceProvider =>
            CreateConsumerOptions(
                serviceProvider.GetRequiredService<IConfiguration>()));
        services.AddSingleton(serviceProvider =>
            CreateRabbitMqOptions(
                serviceProvider.GetRequiredService<IConfiguration>()));
        services.AddHostedService<RequestAssignedNotificationsConsumer>();

        return services;
    }

    public static async Task ApplyNotificationsMigrationsAsync(
        this IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        await using var scope = serviceProvider.CreateAsyncScope();
        var dbContext =
            scope.ServiceProvider.GetRequiredService<NotificationsDbContext>();
        await dbContext.Database.MigrateAsync(cancellationToken);
    }

    private static NotificationsConsumerOptions CreateConsumerOptions(
        IConfiguration configuration)
    {
        var options = new NotificationsConsumerOptions();
        configuration.GetSection("NotificationsConsumer").Bind(options);

        if (string.IsNullOrWhiteSpace(options.QueueName) ||
            options.PrefetchCount == 0)
        {
            throw new InvalidOperationException(
                "A configuração NotificationsConsumer é inválida.");
        }

        return options;
    }

    private static RabbitMqOptions CreateRabbitMqOptions(
        IConfiguration configuration)
    {
        var options = new RabbitMqOptions();
        configuration.GetSection("RabbitMq").Bind(options);

        if (string.IsNullOrWhiteSpace(options.HostName) ||
            options.Port is < 1 or > 65_535 ||
            string.IsNullOrWhiteSpace(options.UserName) ||
            string.IsNullOrWhiteSpace(options.ExchangeName))
        {
            throw new InvalidOperationException(
                "A configuração RabbitMq é inválida.");
        }

        return options;
    }
}

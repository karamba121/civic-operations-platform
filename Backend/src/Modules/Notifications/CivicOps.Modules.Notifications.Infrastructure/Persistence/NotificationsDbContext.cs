using CivicOps.Modules.Notifications.Domain.Notifications;
using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.Notifications.Infrastructure.Persistence;

public sealed class NotificationsDbContext(
    DbContextOptions<NotificationsDbContext> options) : DbContext(options)
{
    public DbSet<Notification> Notifications => Set<Notification>();

    internal DbSet<ProcessedMessage> ProcessedMessages => Set<ProcessedMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("notifications");
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(NotificationsDbContext).Assembly);
    }
}

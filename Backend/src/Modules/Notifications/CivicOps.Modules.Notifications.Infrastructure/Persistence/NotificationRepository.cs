using CivicOps.Modules.Notifications.Application.Abstractions;
using CivicOps.Modules.Notifications.Domain.Notifications;

namespace CivicOps.Modules.Notifications.Infrastructure.Persistence;

internal sealed class NotificationRepository(NotificationsDbContext dbContext)
    : INotificationRepository
{
    public void Add(Notification notification)
    {
        dbContext.Notifications.Add(notification);
    }
}

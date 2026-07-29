using CivicOps.Modules.Notifications.Domain.Notifications;

namespace CivicOps.Modules.Notifications.Application.Abstractions;

public interface INotificationRepository
{
    void Add(Notification notification);
}

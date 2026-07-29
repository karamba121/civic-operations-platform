using CivicOps.Modules.Notifications.Application.ListNotifications;

namespace CivicOps.Modules.Notifications.Application.Abstractions;

public interface INotificationReadService
{
    Task<PagedNotificationsResult> ListAsync(
        ListNotificationsQuery query,
        CancellationToken cancellationToken);
}

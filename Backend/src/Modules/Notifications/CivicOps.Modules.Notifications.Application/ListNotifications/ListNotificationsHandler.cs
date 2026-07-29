using CivicOps.Modules.Notifications.Application.Abstractions;

namespace CivicOps.Modules.Notifications.Application.ListNotifications;

public sealed class ListNotificationsHandler(
    INotificationReadService readService)
{
    public Task<PagedNotificationsResult> HandleAsync(
        ListNotificationsQuery query,
        CancellationToken cancellationToken)
    {
        return readService.ListAsync(query, cancellationToken);
    }
}

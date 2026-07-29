namespace CivicOps.Modules.Notifications.Application.ListNotifications;

public sealed record PagedNotificationsResult(
    IReadOnlyCollection<NotificationListItem> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

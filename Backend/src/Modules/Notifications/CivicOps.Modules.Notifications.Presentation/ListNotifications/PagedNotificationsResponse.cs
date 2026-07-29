namespace CivicOps.Modules.Notifications.Presentation.ListNotifications;

public sealed record PagedNotificationsResponse(
    IReadOnlyCollection<NotificationListItemResponse> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

namespace CivicOps.Modules.Notifications.Application.ListNotifications;

public sealed record NotificationListItem(
    Guid Id,
    Guid RequestId,
    string ProtocolNumber,
    string Type,
    string Title,
    string Content,
    DateTimeOffset CreatedAtUtc);

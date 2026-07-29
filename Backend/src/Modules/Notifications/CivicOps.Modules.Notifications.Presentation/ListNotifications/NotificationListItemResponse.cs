namespace CivicOps.Modules.Notifications.Presentation.ListNotifications;

public sealed record NotificationListItemResponse(
    Guid Id,
    Guid RequestId,
    string ProtocolNumber,
    string Type,
    string Title,
    string Content,
    DateTimeOffset CreatedAtUtc);

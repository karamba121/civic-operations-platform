namespace CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;

public sealed record ProcessNotificationResult(
    bool WasProcessed,
    Guid? NotificationId);

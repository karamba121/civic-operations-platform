namespace CivicOps.Modules.Notifications.Application.ListNotifications;

public sealed class NotificationQueryValidationException(string message)
    : Exception(message);

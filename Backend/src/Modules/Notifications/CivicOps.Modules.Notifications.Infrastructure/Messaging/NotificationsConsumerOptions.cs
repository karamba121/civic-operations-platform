namespace CivicOps.Modules.Notifications.Infrastructure.Messaging;

internal sealed class NotificationsConsumerOptions
{
    public bool Enabled { get; set; }

    public string QueueName { get; set; } =
        "civicops.notifications.request-assigned";

    public ushort PrefetchCount { get; set; } = 16;
}

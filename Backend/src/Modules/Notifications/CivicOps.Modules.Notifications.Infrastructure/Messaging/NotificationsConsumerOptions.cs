namespace CivicOps.Modules.Notifications.Infrastructure.Messaging;

internal sealed class NotificationsConsumerOptions
{
    public bool Enabled { get; set; }

    public string QueueName { get; set; } =
        "civicops.notifications.request-assigned";

    public ushort PrefetchCount { get; set; } = 16;

    public string RetryExchangeName { get; set; } =
        "civicops.notifications.retry";

    public TimeSpan[] RetryDelays { get; set; } = [];

    public string DeadLetterExchangeName { get; set; } =
        "civicops.notifications.dead-letter";

    public string DeadLetterQueueName { get; set; } =
        "civicops.notifications.request-assigned.dead-letter";
}

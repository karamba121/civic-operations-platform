namespace CivicOps.Modules.Notifications.Infrastructure.Persistence;

internal sealed class ProcessedMessage
{
    private ProcessedMessage()
    {
        MessageType = null!;
    }

    public Guid MessageId { get; private init; }

    public string MessageType { get; private init; }

    public DateTimeOffset ProcessedAtUtc { get; private init; }
}

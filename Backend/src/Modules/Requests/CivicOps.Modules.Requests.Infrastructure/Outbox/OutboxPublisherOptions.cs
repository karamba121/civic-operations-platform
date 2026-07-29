namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxPublisherOptions
{
    public bool Enabled { get; set; }

    public int BatchSize { get; set; } = 20;

    public TimeSpan PollingInterval { get; set; } = TimeSpan.FromSeconds(5);

    public TimeSpan LockDuration { get; set; } = TimeSpan.FromSeconds(30);

    public TimeSpan FailureDelay { get; set; } = TimeSpan.FromSeconds(5);
}

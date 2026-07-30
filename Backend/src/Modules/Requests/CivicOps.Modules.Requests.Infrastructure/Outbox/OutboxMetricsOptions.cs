namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxMetricsOptions
{
    public bool Enabled { get; set; } = true;

    public TimeSpan CollectionInterval { get; set; } = TimeSpan.FromSeconds(15);
}

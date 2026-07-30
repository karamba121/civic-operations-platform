namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxRetentionOptions
{
    public bool Enabled { get; set; } = true;

    public TimeSpan RetentionPeriod { get; set; } = TimeSpan.FromDays(30);

    public TimeSpan ExecutionInterval { get; set; } = TimeSpan.FromHours(1);

    public TimeSpan BatchDelay { get; set; } = TimeSpan.FromMilliseconds(100);

    public int BatchSize { get; set; } = 500;

    public int MaxBatchesPerCycle { get; set; } = 20;
}

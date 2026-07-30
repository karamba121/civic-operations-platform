namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed record OutboxMetricsSnapshot(
    long PendingMessages,
    double OldestPendingAgeSeconds,
    long RetryingMessages,
    long LeasedMessages,
    long PendingAttempts);

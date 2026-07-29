namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal interface IOutboxMessageStore
{
    Task<IReadOnlyCollection<ClaimedOutboxMessage>> ClaimPendingAsync(
        Guid lockId,
        DateTimeOffset nowUtc,
        int batchSize,
        TimeSpan lockDuration,
        CancellationToken cancellationToken);

    Task<bool> MarkProcessedAsync(
        Guid messageId,
        Guid lockId,
        DateTimeOffset processedAtUtc,
        CancellationToken cancellationToken);

    Task<bool> MarkFailedAsync(
        Guid messageId,
        Guid lockId,
        string error,
        DateTimeOffset nextAttemptAtUtc,
        CancellationToken cancellationToken);
}

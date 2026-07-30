using System.Diagnostics.Metrics;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

public sealed class OutboxDiagnostics : IDisposable
{
    public const string MeterName = "CivicOps.Requests.Outbox";

    private readonly Meter _meter = new(MeterName);
    private readonly Counter<long> _publishedMessages;
    private readonly Counter<long> _publishFailures;
    private readonly Counter<long> _leaseExpirations;
    private readonly Counter<long> _collectionFailures;
    private long _pendingMessages;
    private long _retryingMessages;
    private long _leasedMessages;
    private long _pendingAttempts;
    private double _oldestPendingAgeSeconds;

    internal Meter Meter => _meter;

    public OutboxDiagnostics()
    {
        _publishedMessages = _meter.CreateCounter<long>(
            "civicops.requests.outbox.published.messages");
        _publishFailures = _meter.CreateCounter<long>(
            "civicops.requests.outbox.publish.failures");
        _leaseExpirations = _meter.CreateCounter<long>(
            "civicops.requests.outbox.lease.expirations");
        _collectionFailures = _meter.CreateCounter<long>(
            "civicops.requests.outbox.metrics.collection.failures");

        _meter.CreateObservableGauge(
            "civicops.requests.outbox.pending.messages",
            () => Volatile.Read(ref _pendingMessages));
        _meter.CreateObservableGauge(
            "civicops.requests.outbox.oldest.pending.age",
            () => Volatile.Read(ref _oldestPendingAgeSeconds),
            unit: "s");
        _meter.CreateObservableGauge(
            "civicops.requests.outbox.retrying.messages",
            () => Volatile.Read(ref _retryingMessages));
        _meter.CreateObservableGauge(
            "civicops.requests.outbox.leased.messages",
            () => Volatile.Read(ref _leasedMessages));
        _meter.CreateObservableGauge(
            "civicops.requests.outbox.pending.attempts",
            () => Volatile.Read(ref _pendingAttempts));
    }

    internal void RecordPublished() => _publishedMessages.Add(1);

    internal void RecordPublishFailure() => _publishFailures.Add(1);

    internal void RecordLeaseExpiration() => _leaseExpirations.Add(1);

    internal void RecordCollectionFailure() => _collectionFailures.Add(1);

    internal void UpdateSnapshot(OutboxMetricsSnapshot snapshot)
    {
        Interlocked.Exchange(ref _pendingMessages, snapshot.PendingMessages);
        Interlocked.Exchange(ref _retryingMessages, snapshot.RetryingMessages);
        Interlocked.Exchange(ref _leasedMessages, snapshot.LeasedMessages);
        Interlocked.Exchange(ref _pendingAttempts, snapshot.PendingAttempts);
        Volatile.Write(
            ref _oldestPendingAgeSeconds,
            snapshot.OldestPendingAgeSeconds);
    }

    public void Dispose() => _meter.Dispose();
}

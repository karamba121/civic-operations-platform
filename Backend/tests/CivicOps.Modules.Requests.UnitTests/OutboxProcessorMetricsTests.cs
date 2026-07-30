using CivicOps.Modules.Requests.Infrastructure.Outbox;
using Microsoft.Extensions.Logging.Abstractions;
using System.Diagnostics.Metrics;
using Xunit;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class OutboxProcessorMetricsTests
{
    [Fact]
    public async Task ProcessBatch_ShouldCountConfirmedPublication()
    {
        var store = new FakeOutboxMessageStore
        {
            MarkProcessedResult = true
        };
        var publisher = new FakePublisher();
        using var diagnostics = new OutboxDiagnostics();
        using var recorder = new CounterRecorder(diagnostics);
        var processor = CreateProcessor(store, publisher, diagnostics);

        var processed = await processor.ProcessBatchAsync(
            TestContext.Current.CancellationToken);

        Assert.Equal(1, processed);
        Assert.Equal(
            1,
            recorder.ValueOf(
                "civicops.requests.outbox.published.messages"));
        Assert.Equal(0, store.MarkFailedCalls);
    }

    [Fact]
    public async Task ProcessBatch_ShouldCountPersistedFailure()
    {
        var store = new FakeOutboxMessageStore
        {
            MarkFailedResult = true
        };
        var publisher = new FakePublisher
        {
            Exception = new InvalidOperationException("Broker indisponível.")
        };
        using var diagnostics = new OutboxDiagnostics();
        using var recorder = new CounterRecorder(diagnostics);
        var processor = CreateProcessor(store, publisher, diagnostics);

        var processed = await processor.ProcessBatchAsync(
            TestContext.Current.CancellationToken);

        Assert.Equal(1, processed);
        Assert.Equal(
            1,
            recorder.ValueOf(
                "civicops.requests.outbox.publish.failures"));
        Assert.Equal(1, store.MarkFailedCalls);
    }

    [Fact]
    public async Task ProcessBatch_ShouldCountExpiredLease()
    {
        var store = new FakeOutboxMessageStore
        {
            MarkProcessedResult = false
        };
        using var diagnostics = new OutboxDiagnostics();
        using var recorder = new CounterRecorder(diagnostics);
        var processor = CreateProcessor(
            store,
            new FakePublisher(),
            diagnostics);

        var processed = await processor.ProcessBatchAsync(
            TestContext.Current.CancellationToken);

        Assert.Equal(1, processed);
        Assert.Equal(
            1,
            recorder.ValueOf(
                "civicops.requests.outbox.lease.expirations"));
    }

    private static OutboxProcessor CreateProcessor(
        IOutboxMessageStore store,
        IIntegrationEventPublisher publisher,
        OutboxDiagnostics diagnostics)
    {
        return new OutboxProcessor(
            store,
            publisher,
            new OutboxPublisherOptions
            {
                BatchSize = 20,
                LockDuration = TimeSpan.FromSeconds(30),
                FailureDelay = TimeSpan.FromSeconds(5)
            },
            TimeProvider.System,
            diagnostics,
            NullLogger<OutboxProcessor>.Instance);
    }

    private sealed class FakeOutboxMessageStore : IOutboxMessageStore
    {
        private static readonly ClaimedOutboxMessage Message = new(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "requests.test.v1",
            "{}",
            DateTimeOffset.UtcNow,
            null,
            null,
            null);

        public bool MarkProcessedResult { get; init; }

        public bool MarkFailedResult { get; init; }

        public int MarkFailedCalls { get; private set; }

        public Task<IReadOnlyCollection<ClaimedOutboxMessage>> ClaimPendingAsync(
            Guid lockId,
            DateTimeOffset nowUtc,
            int batchSize,
            TimeSpan lockDuration,
            CancellationToken cancellationToken)
        {
            IReadOnlyCollection<ClaimedOutboxMessage> messages = [Message];
            return Task.FromResult(messages);
        }

        public Task<bool> MarkProcessedAsync(
            Guid messageId,
            Guid lockId,
            DateTimeOffset processedAtUtc,
            CancellationToken cancellationToken) =>
            Task.FromResult(MarkProcessedResult);

        public Task<bool> MarkFailedAsync(
            Guid messageId,
            Guid lockId,
            string error,
            DateTimeOffset nextAttemptAtUtc,
            CancellationToken cancellationToken)
        {
            MarkFailedCalls++;
            return Task.FromResult(MarkFailedResult);
        }

        public Task<int> DeleteProcessedBatchAsync(
            DateTimeOffset cutoffUtc,
            int batchSize,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(0);
        }
        public Task<OutboxMetricsSnapshot> GetMetricsAsync(
            DateTimeOffset nowUtc,
            CancellationToken cancellationToken) =>
            Task.FromResult(new OutboxMetricsSnapshot(0, 0, 0, 0, 0));
    }

    private sealed class FakePublisher : IIntegrationEventPublisher
    {
        public Exception? Exception { get; init; }

        public Task PublishAsync(
            ClaimedOutboxMessage message,
            CancellationToken cancellationToken)
        {
            return Exception is null
                ? Task.CompletedTask
                : Task.FromException(Exception);
        }
    }

    private sealed class CounterRecorder : IDisposable
    {
        private readonly Dictionary<string, long> _values = [];
        private readonly MeterListener _listener = new();

        public CounterRecorder(OutboxDiagnostics diagnostics)
        {
            _listener.InstrumentPublished = (instrument, listener) =>
            {
                if (ReferenceEquals(instrument.Meter, diagnostics.Meter))
                {
                    listener.EnableMeasurementEvents(instrument);
                }
            };
            _listener.SetMeasurementEventCallback<long>(
                (instrument, measurement, _, _) =>
                {
                    _values[instrument.Name] =
                        _values.GetValueOrDefault(instrument.Name)
                        + measurement;
                });
            _listener.Start();
        }

        public long ValueOf(string instrumentName) =>
            _values.GetValueOrDefault(instrumentName);

        public void Dispose() => _listener.Dispose();
    }
}

using Xunit;
using CivicOps.Modules.Requests.Infrastructure.Outbox;
using Microsoft.Extensions.Logging.Abstractions;
using System.Collections.Concurrent;
using System.Diagnostics.Metrics;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class OutboxRetentionProcessorTests
{
    [Fact]
    public async Task ProcessCycle_ShouldRemoveInBoundedBatchesAndRecordMetric()
    {
        var store = new FakeOutboxMessageStore(2, 2, 1);
        using var diagnostics = new OutboxDiagnostics();
        using var recorder = new CounterRecorder(diagnostics);
        var options = CreateOptions();
        var processor = new OutboxRetentionProcessor(
            store,
            options,
            TimeProvider.System,
            diagnostics,
            NullLogger<OutboxRetentionProcessor>.Instance);

        var removed = await processor.ProcessCycleAsync(
            TestContext.Current.CancellationToken);

        Assert.Equal(5, removed);
        Assert.Equal(3, store.DeleteCalls);
        Assert.Equal(
            5,
            recorder.ValueOf(
                "civicops.requests.outbox.retention.removed.messages"));
    }

    [Fact]
    public async Task ProcessCycle_ShouldStopAtConfiguredBatchLimit()
    {
        var store = new FakeOutboxMessageStore(2, 2, 2);
        using var diagnostics = new OutboxDiagnostics();
        var options = CreateOptions();
        options.MaxBatchesPerCycle = 2;
        var processor = new OutboxRetentionProcessor(
            store,
            options,
            TimeProvider.System,
            diagnostics,
            NullLogger<OutboxRetentionProcessor>.Instance);

        var removed = await processor.ProcessCycleAsync(
            TestContext.Current.CancellationToken);

        Assert.Equal(4, removed);
        Assert.Equal(2, store.DeleteCalls);
    }

    [Fact]
    public async Task ProcessCycle_ShouldRecordFailureWithoutCrashingWorker()
    {
        var store = new FakeOutboxMessageStore(
            new InvalidOperationException("PostgreSQL indisponível."));
        using var diagnostics = new OutboxDiagnostics();
        using var recorder = new CounterRecorder(diagnostics);
        var processor = new OutboxRetentionProcessor(
            store,
            CreateOptions(),
            TimeProvider.System,
            diagnostics,
            NullLogger<OutboxRetentionProcessor>.Instance);

        var removed = await processor.ProcessCycleAsync(
            TestContext.Current.CancellationToken);

        Assert.Equal(0, removed);
        Assert.Equal(
            1,
            recorder.ValueOf(
                "civicops.requests.outbox.retention.failures"));
    }

    private static OutboxRetentionOptions CreateOptions()
    {
        return new OutboxRetentionOptions
        {
            RetentionPeriod = TimeSpan.FromDays(30),
            BatchSize = 2,
            MaxBatchesPerCycle = 10,
            BatchDelay = TimeSpan.Zero
        };
    }

    private sealed class FakeOutboxMessageStore : IOutboxMessageStore
    {
        private readonly Queue<int> _batchResults;
        private readonly Exception? _exception;

        public FakeOutboxMessageStore(params int[] batchResults)
        {
            _batchResults = new Queue<int>(batchResults);
        }

        public FakeOutboxMessageStore(Exception exception)
        {
            _batchResults = new Queue<int>();
            _exception = exception;
        }

        public int DeleteCalls { get; private set; }

        public Task<int> DeleteProcessedBatchAsync(
            DateTimeOffset cutoffUtc,
            int batchSize,
            CancellationToken cancellationToken)
        {
            DeleteCalls++;

            if (_exception is not null)
            {
                throw _exception;
            }

            return Task.FromResult(
                _batchResults.Count > 0 ? _batchResults.Dequeue() : 0);
        }

        public Task<IReadOnlyCollection<ClaimedOutboxMessage>>
            ClaimPendingAsync(
                Guid lockId,
                DateTimeOffset nowUtc,
                int batchSize,
                TimeSpan lockDuration,
                CancellationToken cancellationToken)
        {
            throw new NotSupportedException();
        }

        public Task<bool> MarkProcessedAsync(
            Guid messageId,
            Guid lockId,
            DateTimeOffset processedAtUtc,
            CancellationToken cancellationToken)
        {
            throw new NotSupportedException();
        }

        public Task<bool> MarkFailedAsync(
            Guid messageId,
            Guid lockId,
            string error,
            DateTimeOffset nextAttemptAtUtc,
            CancellationToken cancellationToken)
        {
            throw new NotSupportedException();
        }

        public Task<OutboxMetricsSnapshot> GetMetricsAsync(
            DateTimeOffset nowUtc,
            CancellationToken cancellationToken)
        {
            throw new NotSupportedException();
        }
    }

    private sealed class CounterRecorder : IDisposable
    {
        private readonly ConcurrentDictionary<string, long> _values = [];
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
                    _values.AddOrUpdate(
                        instrument.Name,
                        measurement,
                        (_, current) => current + measurement));
            _listener.Start();
        }

        public long ValueOf(string instrumentName)
        {
            return _values.GetValueOrDefault(instrumentName);
        }

        public void Dispose()
        {
            _listener.Dispose();
        }
    }
}

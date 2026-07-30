using Xunit;
using CivicOps.Modules.Requests.Infrastructure.Outbox;
using System.Diagnostics.Metrics;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class OutboxDiagnosticsTests
{
    [Fact]
    public void Diagnostics_ShouldPublishCountersAndAggregateGaugesWithoutLabels()
    {
        var measurements = new List<MetricMeasurement>();
        using var diagnostics = new OutboxDiagnostics();
        using var listener = CreateListener(diagnostics, measurements);

        diagnostics.RecordPublished();
        diagnostics.RecordPublishFailure();
        diagnostics.RecordLeaseExpiration();
        diagnostics.RecordCollectionFailure();
        diagnostics.RecordRetentionRemoved(7);
        diagnostics.RecordRetentionFailure();
        diagnostics.UpdateSnapshot(
            new OutboxMetricsSnapshot(
                PendingMessages: 12,
                OldestPendingAgeSeconds: 95.5,
                RetryingMessages: 4,
                LeasedMessages: 2,
                PendingAttempts: 9));

        listener.RecordObservableInstruments();

        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.published.messages",
            1);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.publish.failures",
            1);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.lease.expirations",
            1);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.metrics.collection.failures",
            1);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.retention.removed.messages",
            7);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.retention.failures",
            1);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.pending.messages",
            12);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.oldest.pending.age",
            95.5);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.retrying.messages",
            4);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.leased.messages",
            2);
        AssertMeasurement(
            measurements,
            "civicops.requests.outbox.pending.attempts",
            9);
        Assert.All(measurements, measurement => Assert.Equal(0, measurement.TagCount));
    }

    private static MeterListener CreateListener(
        OutboxDiagnostics diagnostics,
        ICollection<MetricMeasurement> measurements)
    {
        var listener = new MeterListener
        {
            InstrumentPublished = (instrument, meterListener) =>
            {
                if (ReferenceEquals(instrument.Meter, diagnostics.Meter))
                {
                    meterListener.EnableMeasurementEvents(instrument);
                }
            }
        };

        listener.SetMeasurementEventCallback<long>(
            (instrument, measurement, tags, _) =>
                measurements.Add(
                    new MetricMeasurement(
                        instrument.Name,
                        measurement,
                        tags.Length)));
        listener.SetMeasurementEventCallback<double>(
            (instrument, measurement, tags, _) =>
                measurements.Add(
                    new MetricMeasurement(
                        instrument.Name,
                        measurement,
                        tags.Length)));
        listener.Start();
        return listener;
    }

    private static void AssertMeasurement(
        IEnumerable<MetricMeasurement> measurements,
        string name,
        double expected)
    {
        var measurement = Assert.Single(
            measurements,
            item => item.Name == name);
        Assert.Equal(expected, measurement.Value, precision: 3);
    }

    private sealed record MetricMeasurement(
        string Name,
        double Value,
        int TagCount);
}

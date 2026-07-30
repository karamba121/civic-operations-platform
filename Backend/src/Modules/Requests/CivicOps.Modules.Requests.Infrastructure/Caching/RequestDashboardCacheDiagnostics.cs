using System.Diagnostics.Metrics;

namespace CivicOps.Modules.Requests.Infrastructure.Caching;

public static class RequestDashboardCacheDiagnostics
{
    public const string MeterName = "CivicOps.Requests.Cache";

    internal static Meter Meter { get; } = new(MeterName);

    internal static Counter<long> Hits { get; } =
        Meter.CreateCounter<long>("civicops.requests.dashboard.cache.hits");

    internal static Counter<long> Misses { get; } =
        Meter.CreateCounter<long>("civicops.requests.dashboard.cache.misses");

    internal static Counter<long> Failures { get; } =
        Meter.CreateCounter<long>("civicops.requests.dashboard.cache.failures");

    internal static Counter<long> Invalidations { get; } =
        Meter.CreateCounter<long>(
            "civicops.requests.dashboard.cache.invalidations");

    internal static Histogram<double> OperationDuration { get; } =
        Meter.CreateHistogram<double>(
            "civicops.requests.dashboard.cache.operation.duration",
            unit: "ms");
}

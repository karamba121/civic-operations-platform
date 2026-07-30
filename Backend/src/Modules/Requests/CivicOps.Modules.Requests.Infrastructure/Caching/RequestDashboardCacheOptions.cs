namespace CivicOps.Modules.Requests.Infrastructure.Caching;

internal sealed class RequestDashboardCacheOptions
{
    public bool Enabled { get; init; } = true;

    public TimeSpan TimeToLive { get; init; } = TimeSpan.FromSeconds(30);
}

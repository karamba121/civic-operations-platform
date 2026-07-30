using CivicOps.Modules.Requests.Application.GetRequestDashboard;

namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestDashboardCache
{
    Task<RequestDashboardCacheLookup> GetAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task SetAsync(
        Guid tenantId,
        long generation,
        RequestDashboardResult dashboard,
        CancellationToken cancellationToken);

    Task InvalidateAsync(
        Guid tenantId,
        CancellationToken cancellationToken);
}

public sealed record RequestDashboardCacheLookup(
    RequestDashboardResult? Dashboard,
    long Generation);

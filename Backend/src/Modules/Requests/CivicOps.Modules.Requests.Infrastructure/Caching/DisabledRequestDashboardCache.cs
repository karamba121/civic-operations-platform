using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.GetRequestDashboard;

namespace CivicOps.Modules.Requests.Infrastructure.Caching;

internal sealed class DisabledRequestDashboardCache : IRequestDashboardCache
{
    public Task<RequestDashboardCacheLookup> GetAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(
            new RequestDashboardCacheLookup(
                Dashboard: null,
                Generation: 0));
    }

    public Task SetAsync(
        Guid tenantId,
        long generation,
        RequestDashboardResult dashboard,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public Task InvalidateAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}

using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.ListRequests;

namespace CivicOps.Modules.Requests.Application.GetRequestDashboard;

public sealed class GetRequestDashboardHandler(
    IRequestReadService readService,
    IRequestDashboardCache cache,
    TimeProvider timeProvider)
{
    public async Task<RequestDashboardResult> HandleAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        if (tenantId == Guid.Empty)
        {
            throw new RequestQueryValidationException(
                "O tenant é obrigatório.");
        }

        var cached = await cache.GetAsync(tenantId, cancellationToken);
        if (cached.Dashboard is not null)
        {
            return cached.Dashboard;
        }

        var dashboard = await readService.GetDashboardAsync(
            tenantId,
            timeProvider.GetUtcNow(),
            cancellationToken);
        await cache.SetAsync(
            tenantId,
            cached.Generation,
            dashboard,
            cancellationToken);
        return dashboard;
    }
}

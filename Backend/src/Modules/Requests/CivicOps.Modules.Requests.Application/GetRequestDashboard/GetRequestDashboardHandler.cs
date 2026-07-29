using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.ListRequests;

namespace CivicOps.Modules.Requests.Application.GetRequestDashboard;

public sealed class GetRequestDashboardHandler(
    IRequestReadService readService,
    TimeProvider timeProvider)
{
    public Task<RequestDashboardResult> HandleAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        if (tenantId == Guid.Empty)
        {
            throw new RequestQueryValidationException(
                "O tenant é obrigatório.");
        }

        return readService.GetDashboardAsync(
            tenantId,
            timeProvider.GetUtcNow(),
            cancellationToken);
    }
}

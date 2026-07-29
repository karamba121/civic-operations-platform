using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.ListRequests;

namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestReadService
{
    Task<PagedRequestResult> ListAsync(
        ListRequestsQuery query,
        CancellationToken cancellationToken);

    Task<RequestDetailsResult?> GetDetailsAsync(
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken);
}

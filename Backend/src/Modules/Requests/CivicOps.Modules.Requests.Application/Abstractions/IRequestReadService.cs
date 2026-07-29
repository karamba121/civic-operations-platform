using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.ListRequestComments;
using CivicOps.Modules.Requests.Application.ListRequestAudit;
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

    Task<PagedRequestCommentsResult?> ListCommentsAsync(
        ListRequestCommentsQuery query,
        CancellationToken cancellationToken);

    Task<PagedRequestAuditResult?> ListAuditAsync(
        ListRequestAuditQuery query,
        CancellationToken cancellationToken);
}

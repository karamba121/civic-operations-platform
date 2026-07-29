using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.ListRequestAudit;

public sealed class ListRequestAuditHandler(IRequestReadService readService)
{
    public Task<PagedRequestAuditResult?> HandleAsync(
        ListRequestAuditQuery query,
        CancellationToken cancellationToken)
    {
        return readService.ListAuditAsync(query, cancellationToken);
    }
}

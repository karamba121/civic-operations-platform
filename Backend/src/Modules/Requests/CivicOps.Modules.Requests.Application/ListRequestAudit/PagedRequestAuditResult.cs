namespace CivicOps.Modules.Requests.Application.ListRequestAudit;

public sealed record PagedRequestAuditResult(
    IReadOnlyCollection<RequestAuditListItem> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

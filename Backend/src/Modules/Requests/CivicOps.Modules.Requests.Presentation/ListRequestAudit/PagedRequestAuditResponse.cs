namespace CivicOps.Modules.Requests.Presentation.ListRequestAudit;

public sealed record PagedRequestAuditResponse(
    IReadOnlyCollection<RequestAuditListItemResponse> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

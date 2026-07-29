namespace CivicOps.Modules.Requests.Application.ListRequests;

public sealed record PagedRequestResult(
    IReadOnlyList<RequestListItem> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

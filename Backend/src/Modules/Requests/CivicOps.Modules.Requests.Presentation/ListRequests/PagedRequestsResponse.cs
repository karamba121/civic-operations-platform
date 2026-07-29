namespace CivicOps.Modules.Requests.Presentation.ListRequests;

public sealed record PagedRequestsResponse(
    IReadOnlyList<RequestListItemResponse> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

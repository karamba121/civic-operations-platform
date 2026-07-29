namespace CivicOps.Modules.Requests.Presentation.ListRequestComments;

public sealed record PagedRequestCommentsResponse(
    IReadOnlyCollection<RequestCommentListItemResponse> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

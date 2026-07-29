namespace CivicOps.Modules.Requests.Application.ListRequestComments;

public sealed record PagedRequestCommentsResult(
    IReadOnlyCollection<RequestCommentListItem> Items,
    int Page,
    int PageSize,
    long TotalItems,
    long TotalPages);

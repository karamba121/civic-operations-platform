namespace CivicOps.Modules.Requests.Presentation.ListRequestComments;

public sealed record RequestCommentListItemResponse(
    Guid Id,
    Guid AuthorUserId,
    string Content,
    DateTimeOffset CreatedAtUtc);

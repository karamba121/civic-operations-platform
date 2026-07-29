namespace CivicOps.Modules.Requests.Application.ListRequestComments;

public sealed record RequestCommentListItem(
    Guid Id,
    Guid AuthorUserId,
    string Content,
    DateTimeOffset CreatedAtUtc);

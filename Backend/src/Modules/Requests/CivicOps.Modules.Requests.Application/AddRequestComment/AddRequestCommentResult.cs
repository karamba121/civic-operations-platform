namespace CivicOps.Modules.Requests.Application.AddRequestComment;

public sealed record AddRequestCommentResult(
    Guid Id,
    Guid RequestId,
    Guid AuthorUserId,
    string Content,
    DateTimeOffset CreatedAtUtc);

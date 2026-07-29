namespace CivicOps.Modules.Requests.Presentation.AddRequestComment;

public sealed record RequestCommentResponse(
    Guid Id,
    Guid RequestId,
    Guid AuthorUserId,
    string Content,
    DateTimeOffset CreatedAtUtc);

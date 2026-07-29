namespace CivicOps.Modules.Requests.Presentation.AddRequestComment;

public sealed record AddRequestCommentRequest(
    Guid AuthorUserId,
    string Content);

namespace CivicOps.Modules.Requests.Application.AddRequestComment;

public sealed record AddRequestCommentCommand(
    Guid TenantId,
    Guid RequestId,
    Guid AuthorUserId,
    string Content);

namespace CivicOps.Modules.Requests.Domain.Requests.Events;

public sealed record RequestCommentAddedDomainEvent(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    Guid CommentId) : IRequestDomainEvent;

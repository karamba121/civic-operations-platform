namespace CivicOps.Modules.Requests.Domain.Requests.Events;

public sealed record RequestAttachmentAddedDomainEvent(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    Guid AttachmentId,
    string FileName,
    string ContentType,
    long SizeBytes,
    string Sha256) : IRequestDomainEvent;

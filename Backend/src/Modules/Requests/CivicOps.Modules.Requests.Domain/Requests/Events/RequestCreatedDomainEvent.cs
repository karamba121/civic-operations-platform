namespace CivicOps.Modules.Requests.Domain.Requests.Events;

public sealed record RequestCreatedDomainEvent(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    string ProtocolNumber,
    RequestStatus Status,
    Guid Version) : IRequestDomainEvent;

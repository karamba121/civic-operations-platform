namespace CivicOps.Modules.Requests.Domain.Requests.Events;

public sealed record RequestStatusChangedDomainEvent(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    RequestStatus PreviousStatus,
    RequestStatus Status,
    Guid Version) : IRequestDomainEvent;

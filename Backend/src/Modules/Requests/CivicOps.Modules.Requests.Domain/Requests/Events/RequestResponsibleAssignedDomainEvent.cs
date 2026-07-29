namespace CivicOps.Modules.Requests.Domain.Requests.Events;

public sealed record RequestResponsibleAssignedDomainEvent(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    string ProtocolNumber,
    Guid? PreviousResponsibleUserId,
    Guid ResponsibleUserId,
    Guid Version) : IRequestDomainEvent;

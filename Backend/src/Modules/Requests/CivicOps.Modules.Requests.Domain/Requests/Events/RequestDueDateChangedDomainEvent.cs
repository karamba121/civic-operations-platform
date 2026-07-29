namespace CivicOps.Modules.Requests.Domain.Requests.Events;

public sealed record RequestDueDateChangedDomainEvent(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    DateTimeOffset? PreviousDueDateUtc,
    DateTimeOffset? DueDateUtc,
    Guid Version) : IRequestDomainEvent;

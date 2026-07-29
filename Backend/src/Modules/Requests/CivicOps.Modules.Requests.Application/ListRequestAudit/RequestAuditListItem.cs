namespace CivicOps.Modules.Requests.Application.ListRequestAudit;

public sealed record RequestAuditListItem(
    Guid Id,
    Guid EventId,
    Guid ActorUserId,
    string Action,
    string Data,
    DateTimeOffset OccurredAtUtc);

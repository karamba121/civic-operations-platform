using System.Text.Json;

namespace CivicOps.Modules.Requests.Presentation.ListRequestAudit;

public sealed record RequestAuditListItemResponse(
    Guid Id,
    Guid EventId,
    Guid ActorUserId,
    string Action,
    JsonElement Data,
    DateTimeOffset OccurredAtUtc);

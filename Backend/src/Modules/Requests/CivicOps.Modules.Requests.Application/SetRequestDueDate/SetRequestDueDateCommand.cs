namespace CivicOps.Modules.Requests.Application.SetRequestDueDate;

public sealed record SetRequestDueDateCommand(
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    DateTimeOffset? DueDateUtc,
    Guid ExpectedVersion);

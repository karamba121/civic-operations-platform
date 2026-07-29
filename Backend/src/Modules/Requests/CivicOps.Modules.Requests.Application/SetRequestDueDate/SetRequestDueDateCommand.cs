namespace CivicOps.Modules.Requests.Application.SetRequestDueDate;

public sealed record SetRequestDueDateCommand(
    Guid TenantId,
    Guid RequestId,
    DateTimeOffset? DueDateUtc,
    Guid ExpectedVersion);

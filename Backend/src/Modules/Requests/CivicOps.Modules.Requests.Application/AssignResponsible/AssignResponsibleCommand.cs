namespace CivicOps.Modules.Requests.Application.AssignResponsible;

public sealed record AssignResponsibleCommand(
    Guid TenantId,
    Guid RequestId,
    Guid ResponsibleUserId,
    Guid ExpectedVersion);

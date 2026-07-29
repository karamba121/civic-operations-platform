namespace CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;

public sealed record ProcessRequestAssignedCommand(
    Guid MessageId,
    Guid TenantId,
    Guid RequestId,
    string ProtocolNumber,
    Guid ResponsibleUserId,
    DateTimeOffset OccurredAtUtc);

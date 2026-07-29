namespace CivicOps.Modules.Notifications.Infrastructure.Messaging;

internal sealed record RequestResponsibleAssignedIntegrationEvent(
    Guid EventId,
    DateTimeOffset OccurredAtUtc,
    Guid TenantId,
    Guid RequestId,
    Guid ActorUserId,
    string? ProtocolNumber,
    Guid? PreviousResponsibleUserId,
    Guid ResponsibleUserId,
    Guid Version);

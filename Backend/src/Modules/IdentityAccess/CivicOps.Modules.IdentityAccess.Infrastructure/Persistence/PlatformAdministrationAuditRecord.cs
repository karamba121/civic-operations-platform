namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class PlatformAdministrationAuditRecord
{
    private PlatformAdministrationAuditRecord(
        Guid id,
        Guid actorUserId,
        Guid? targetTenantId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        Id = id;
        ActorUserId = actorUserId;
        TargetTenantId = targetTenantId;
        TargetUserId = targetUserId;
        Action = action;
        Data = data;
        OccurredAtUtc = occurredAtUtc;
    }

    private PlatformAdministrationAuditRecord()
    {
    }

    public Guid Id { get; private init; }

    public Guid ActorUserId { get; private init; }

    public Guid? TargetTenantId { get; private init; }

    public Guid? TargetUserId { get; private init; }

    public string Action { get; private init; } = string.Empty;

    public string Data { get; private init; } = string.Empty;

    public DateTimeOffset OccurredAtUtc { get; private init; }

    public static PlatformAdministrationAuditRecord Create(
        Guid actorUserId,
        Guid? targetTenantId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        return new PlatformAdministrationAuditRecord(
            Guid.CreateVersion7(),
            actorUserId,
            targetTenantId,
            targetUserId,
            action,
            data,
            occurredAtUtc);
    }
}

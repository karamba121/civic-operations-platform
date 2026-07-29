namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class IdentityAccessAuditRecord
{
    private IdentityAccessAuditRecord()
    {
        Action = null!;
        Data = null!;
    }

    private IdentityAccessAuditRecord(
        Guid id,
        Guid tenantId,
        Guid actorUserId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        Id = id;
        TenantId = tenantId;
        ActorUserId = actorUserId;
        TargetUserId = targetUserId;
        Action = action;
        Data = data;
        OccurredAtUtc = occurredAtUtc;
    }

    public Guid Id { get; private init; }

    public Guid TenantId { get; private init; }

    public Guid ActorUserId { get; private init; }

    public Guid? TargetUserId { get; private init; }

    public string Action { get; private init; }

    public string Data { get; private init; }

    public DateTimeOffset OccurredAtUtc { get; private init; }

    public static IdentityAccessAuditRecord Create(
        Guid tenantId,
        Guid actorUserId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        return new IdentityAccessAuditRecord(
            Guid.CreateVersion7(),
            tenantId,
            actorUserId,
            targetUserId,
            action,
            data,
            occurredAtUtc);
    }
}

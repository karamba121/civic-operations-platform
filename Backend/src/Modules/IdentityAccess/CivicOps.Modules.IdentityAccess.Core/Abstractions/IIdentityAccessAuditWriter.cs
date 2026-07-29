namespace CivicOps.Modules.IdentityAccess;

public interface IIdentityAccessAuditWriter
{
    void Add(
        Guid tenantId,
        Guid actorUserId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc);
}

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class IdentityAccessAuditWriter(
    IdentityAccessDbContext dbContext) : IIdentityAccessAuditWriter
{
    public void Add(
        Guid tenantId,
        Guid actorUserId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        dbContext.AuditRecords.Add(
            IdentityAccessAuditRecord.Create(
                tenantId,
                actorUserId,
                targetUserId,
                action,
                data,
                occurredAtUtc));
    }
}

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class PlatformAdministrationAuditWriter(
    IdentityAccessDbContext dbContext)
    : IPlatformAdministrationAuditWriter
{
    public void Write(
        Guid actorUserId,
        Guid? targetTenantId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        dbContext.PlatformAdministrationAuditRecords.Add(
            PlatformAdministrationAuditRecord.Create(
                actorUserId,
                targetTenantId,
                targetUserId,
                action,
                data,
                occurredAtUtc));
    }
}

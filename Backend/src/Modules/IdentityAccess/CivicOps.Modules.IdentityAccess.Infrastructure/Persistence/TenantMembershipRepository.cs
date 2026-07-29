using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class TenantMembershipRepository(
    IdentityAccessDbContext dbContext) : ITenantMembershipRepository
{
    public void Add(TenantMembership membership)
    {
        dbContext.TenantMemberships.Add(membership);
    }

    public Task AcquireTenantLockAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"""
             SELECT pg_advisory_xact_lock(
                 hashtextextended({tenantId.ToString()}, 0));
             """,
            cancellationToken);
    }

    public Task<bool> AnyAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return dbContext.TenantMemberships
            .AnyAsync(
                membership =>
                    membership.TenantId == tenantId &&
                    membership.IsActive,
                cancellationToken);
    }

    public Task<TenantMembership?> GetAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return dbContext.TenantMemberships.SingleOrDefaultAsync(
            membership =>
                membership.TenantId == tenantId &&
                membership.UserId == userId,
            cancellationToken);
    }

    public Task<int> CountActiveAdministratorsAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return dbContext.TenantMemberships.CountAsync(
            membership =>
                membership.TenantId == tenantId &&
                membership.Role == TenantRole.Administrator &&
                membership.IsActive,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<TenantMembership>> ListAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return await dbContext.TenantMemberships
            .AsNoTracking()
            .Where(
                membership =>
                    membership.TenantId == tenantId &&
                    membership.IsActive)
            .OrderBy(membership => membership.Role)
            .ThenBy(membership => membership.UserId)
            .ToArrayAsync(cancellationToken);
    }
}

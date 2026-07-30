using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class TenantRepository(
    IdentityAccessDbContext dbContext) : ITenantRepository
{
    public void Add(Tenant tenant)
    {
        dbContext.Tenants.Add(tenant);
    }

    public Task<bool> SlugExistsAsync(
        string slug,
        CancellationToken cancellationToken)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        return dbContext.Tenants.AnyAsync(
            tenant => tenant.Slug == normalizedSlug,
            cancellationToken);
    }

    public Task<Tenant?> GetAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        return dbContext.Tenants.SingleOrDefaultAsync(
            tenant => tenant.Id == tenantId,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<Tenant>> ListAsync(
        CancellationToken cancellationToken)
    {
        return await dbContext.Tenants
            .AsNoTracking()
            .OrderBy(tenant => tenant.Name)
            .ThenBy(tenant => tenant.Id)
            .ToArrayAsync(cancellationToken);
    }
}

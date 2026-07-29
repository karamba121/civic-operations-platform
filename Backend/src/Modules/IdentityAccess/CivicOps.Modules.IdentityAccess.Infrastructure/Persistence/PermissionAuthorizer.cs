using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class PermissionAuthorizer(
    IdentityAccessDbContext dbContext) : IPermissionAuthorizer
{
    public async Task<bool> HasPermissionAsync(
        Guid tenantId,
        Guid userId,
        string permission,
        CancellationToken cancellationToken)
    {
        var role = await dbContext.TenantMemberships
            .AsNoTracking()
            .Where(
                membership =>
                    membership.TenantId == tenantId &&
                    membership.UserId == userId &&
                    membership.IsActive)
            .Select(membership => (TenantRole?)membership.Role)
            .SingleOrDefaultAsync(cancellationToken);

        return role is not null &&
            RolePermissionCatalog.HasPermission(role.Value, permission);
    }
}

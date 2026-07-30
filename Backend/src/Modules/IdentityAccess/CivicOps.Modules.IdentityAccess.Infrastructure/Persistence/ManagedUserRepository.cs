using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class ManagedUserRepository(
    IdentityAccessDbContext dbContext) : IManagedUserRepository
{
    public void Add(ManagedUser user)
    {
        dbContext.ManagedUsers.Add(user);
    }

    public Task<bool> UsernameExistsAsync(
        string username,
        CancellationToken cancellationToken)
    {
        var normalizedUsername = username.Trim().ToLowerInvariant();
        return dbContext.ManagedUsers.AnyAsync(
            user => user.Username == normalizedUsername,
            cancellationToken);
    }

    public Task<bool> IsActivePlatformAdministratorAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        return dbContext.ManagedUsers.AnyAsync(
            user =>
                user.Id == userId &&
                user.IsPlatformAdministrator &&
                user.IsActive,
            cancellationToken);
    }

    public async Task<IReadOnlyCollection<ManagedUser>>
        ListPlatformAdministratorsAsync(
            CancellationToken cancellationToken)
    {
        return await dbContext.ManagedUsers
            .AsNoTracking()
            .Where(user =>
                user.IsPlatformAdministrator &&
                user.IsActive)
            .OrderBy(user => user.Username)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ManagedUser>>
        ListTenantUsersAsync(
            Guid tenantId,
            CancellationToken cancellationToken)
    {
        return await dbContext.ManagedUsers
            .AsNoTracking()
            .Where(user =>
                user.TenantId == tenantId &&
                user.IsActive)
            .OrderBy(user => user.DisplayName)
            .ThenBy(user => user.Username)
            .ToArrayAsync(cancellationToken);
    }
}

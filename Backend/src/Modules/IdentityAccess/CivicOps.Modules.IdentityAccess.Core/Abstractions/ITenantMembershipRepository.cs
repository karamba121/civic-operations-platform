namespace CivicOps.Modules.IdentityAccess;

public interface ITenantMembershipRepository
{
    void Add(TenantMembership membership);

    Task AcquireTenantLockAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<bool> AnyAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<TenantMembership?> GetAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken);

    Task<int> CountActiveAdministratorsAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<TenantMembership>> ListAsync(
        Guid tenantId,
        CancellationToken cancellationToken);
}

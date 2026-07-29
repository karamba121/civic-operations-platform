namespace CivicOps.Modules.IdentityAccess;

public sealed class BootstrapTenantAdministratorHandler(
    ITenantMembershipRepository repository,
    IIdentityAccessUnitOfWork unitOfWork,
    IIdentityAccessAuditWriter auditWriter,
    TimeProvider timeProvider)
{
    public Task<MembershipResult> HandleAsync(
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return unitOfWork.ExecuteInTransactionAsync(
            async transactionCancellationToken =>
            {
                await repository.AcquireTenantLockAsync(
                    tenantId,
                    transactionCancellationToken);

                if (await repository.AnyAsync(
                        tenantId,
                        transactionCancellationToken))
                {
                    throw new TenantBootstrapConflictException();
                }

                var membership = TenantMembership.Create(
                    tenantId,
                    userId,
                    TenantRole.Administrator,
                    userId,
                    timeProvider.GetUtcNow());
                repository.Add(membership);
                auditWriter.Add(
                    tenantId,
                    userId,
                    userId,
                    IdentityAccessAuditActions
                        .TenantAdministratorBootstrapped,
                    """{"role":"Administrator"}""",
                    membership.CreatedAtUtc);

                return ToResult(membership);
            },
            cancellationToken);
    }

    private static MembershipResult ToResult(TenantMembership membership)
    {
        return new MembershipResult(
            membership.UserId,
            membership.Role.ToString(),
            RolePermissionCatalog.GetPermissions(membership.Role)
                .Order(StringComparer.Ordinal)
                .ToArray(),
            membership.UpdatedAtUtc);
    }
}

using CivicOps.BuildingBlocks.Domain;

namespace CivicOps.Modules.IdentityAccess;

public sealed class SetTenantMemberRoleHandler(
    ITenantMembershipRepository repository,
    IIdentityAccessUnitOfWork unitOfWork,
    IPermissionAuthorizer authorizer,
    TimeProvider timeProvider)
{
    public async Task<MembershipResult> HandleAsync(
        Guid tenantId,
        Guid actorUserId,
        Guid targetUserId,
        TenantRole role,
        CancellationToken cancellationToken)
    {
        return await unitOfWork.ExecuteInTransactionAsync(
            async transactionCancellationToken =>
            {
                await repository.AcquireTenantLockAsync(
                    tenantId,
                    transactionCancellationToken);

                if (!await authorizer.HasPermissionAsync(
                        tenantId,
                        actorUserId,
                        PermissionNames.AccessManage,
                        transactionCancellationToken))
                {
                    throw new IdentityAccessDeniedException(
                        PermissionNames.AccessManage);
                }

                var membership = await repository.GetAsync(
                    tenantId,
                    targetUserId,
                    transactionCancellationToken);

                if (membership is null)
                {
                    membership = TenantMembership.Create(
                        tenantId,
                        targetUserId,
                        role,
                        actorUserId,
                        timeProvider.GetUtcNow());
                    repository.Add(membership);
                }
                else
                {
                    if (membership.Role == TenantRole.Administrator &&
                        role != TenantRole.Administrator &&
                        await repository.CountActiveAdministratorsAsync(
                            tenantId,
                            transactionCancellationToken) <= 1)
                    {
                        throw new DomainException(
                            "O tenant deve manter ao menos um administrador ativo.");
                    }

                    membership.ChangeRole(
                        role,
                        actorUserId,
                        timeProvider.GetUtcNow());
                }

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

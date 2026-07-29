using System.Text.Json;

namespace CivicOps.Modules.IdentityAccess;

public sealed class ListTenantMembersHandler(
    ITenantMembershipRepository repository,
    IPermissionAuthorizer authorizer,
    IIdentityAccessUnitOfWork unitOfWork,
    IIdentityAccessAuditWriter auditWriter,
    TimeProvider timeProvider)
{
    public Task<IReadOnlyCollection<MembershipResult>> HandleAsync(
        Guid tenantId,
        Guid actorUserId,
        CancellationToken cancellationToken)
    {
        return unitOfWork.ExecuteInTransactionAsync<IReadOnlyCollection<MembershipResult>>(
            async transactionCancellationToken =>
            {
                if (!await authorizer.HasPermissionAsync(
                        tenantId,
                        actorUserId,
                        PermissionNames.AccessManage,
                        transactionCancellationToken))
                {
                    throw new IdentityAccessDeniedException(
                        PermissionNames.AccessManage);
                }

                var memberships = await repository.ListAsync(
                    tenantId,
                    transactionCancellationToken);
                var results = memberships
                    .Select(membership => new MembershipResult(
                        membership.UserId,
                        membership.Role.ToString(),
                        RolePermissionCatalog.GetPermissions(membership.Role)
                            .Order(StringComparer.Ordinal)
                            .ToArray(),
                        membership.UpdatedAtUtc))
                    .ToArray();

                auditWriter.Add(
                    tenantId,
                    actorUserId,
                    targetUserId: null,
                    IdentityAccessAuditActions.TenantMembersListed,
                    JsonSerializer.Serialize(new { count = results.Length }),
                    timeProvider.GetUtcNow());

                return results;
            },
            cancellationToken);
    }
}

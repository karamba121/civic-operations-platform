namespace CivicOps.Modules.IdentityAccess;

public sealed class ListTenantMembersHandler(
    ITenantMembershipRepository repository,
    IPermissionAuthorizer authorizer)
{
    public async Task<IReadOnlyCollection<MembershipResult>> HandleAsync(
        Guid tenantId,
        Guid actorUserId,
        CancellationToken cancellationToken)
    {
        if (!await authorizer.HasPermissionAsync(
                tenantId,
                actorUserId,
                PermissionNames.AccessManage,
                cancellationToken))
        {
            throw new IdentityAccessDeniedException(
                PermissionNames.AccessManage);
        }

        var memberships = await repository.ListAsync(
            tenantId,
            cancellationToken);

        return memberships
            .Select(membership => new MembershipResult(
                membership.UserId,
                membership.Role.ToString(),
                RolePermissionCatalog.GetPermissions(membership.Role)
                    .Order(StringComparer.Ordinal)
                    .ToArray(),
                membership.UpdatedAtUtc))
            .ToArray();
    }
}

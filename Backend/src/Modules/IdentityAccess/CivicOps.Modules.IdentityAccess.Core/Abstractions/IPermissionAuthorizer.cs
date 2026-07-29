namespace CivicOps.Modules.IdentityAccess;

public interface IPermissionAuthorizer
{
    Task<bool> HasPermissionAsync(
        Guid tenantId,
        Guid userId,
        string permission,
        CancellationToken cancellationToken);
}

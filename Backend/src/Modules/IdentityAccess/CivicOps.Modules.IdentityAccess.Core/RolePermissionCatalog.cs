using System.Collections.Frozen;

namespace CivicOps.Modules.IdentityAccess;

public static class RolePermissionCatalog
{
    private static readonly IReadOnlyDictionary<TenantRole, IReadOnlySet<string>>
        PermissionsByRole =
            new Dictionary<TenantRole, IReadOnlySet<string>>
            {
                [TenantRole.Administrator] = new[]
                    {
                        PermissionNames.AccessManage,
                        PermissionNames.AttachmentsRead,
                        PermissionNames.AttachmentsWrite
                    }
                    .ToFrozenSet(StringComparer.Ordinal),
                [TenantRole.Operator] = new[]
                    {
                        PermissionNames.AttachmentsRead,
                        PermissionNames.AttachmentsWrite
                    }
                    .ToFrozenSet(StringComparer.Ordinal),
                [TenantRole.Reader] = new[]
                    {
                        PermissionNames.AttachmentsRead
                    }
                    .ToFrozenSet(StringComparer.Ordinal)
            };

    public static IReadOnlySet<string> GetPermissions(TenantRole role)
    {
        return PermissionsByRole[role];
    }

    public static bool HasPermission(
        TenantRole role,
        string permission)
    {
        return GetPermissions(role).Contains(permission);
    }
}

using CivicOps.BuildingBlocks.Domain;
using CivicOps.Modules.IdentityAccess;
using Xunit;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class IdentityAccessTests
{
    [Fact]
    public void RoleCatalog_ShouldApplyLeastPrivilege()
    {
        Assert.True(RolePermissionCatalog.HasPermission(
            TenantRole.Administrator,
            PermissionNames.AccessManage));
        Assert.True(RolePermissionCatalog.HasPermission(
            TenantRole.Operator,
            PermissionNames.AttachmentsWrite));
        Assert.False(RolePermissionCatalog.HasPermission(
            TenantRole.Operator,
            PermissionNames.AccessManage));
        Assert.True(RolePermissionCatalog.HasPermission(
            TenantRole.Reader,
            PermissionNames.AttachmentsRead));
        Assert.False(RolePermissionCatalog.HasPermission(
            TenantRole.Reader,
            PermissionNames.AttachmentsWrite));
    }

    [Fact]
    public void Membership_ShouldRecordRoleChangesAndActor()
    {
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var administratorId = Guid.NewGuid();
        var operatorId = Guid.NewGuid();
        var createdAtUtc = DateTimeOffset.UtcNow;
        var membership = TenantMembership.Create(
            tenantId,
            userId,
            TenantRole.Reader,
            administratorId,
            createdAtUtc);
        var updatedAtUtc = createdAtUtc.AddMinutes(1);

        membership.ChangeRole(
            TenantRole.Operator,
            operatorId,
            updatedAtUtc);

        Assert.Equal(TenantRole.Operator, membership.Role);
        Assert.Equal(operatorId, membership.UpdatedByUserId);
        Assert.Equal(updatedAtUtc, membership.UpdatedAtUtc);
        Assert.True(membership.IsActive);
    }

    [Fact]
    public void Membership_ShouldRejectEmptyTenant()
    {
        var action = () => TenantMembership.Create(
            Guid.Empty,
            Guid.NewGuid(),
            TenantRole.Reader,
            Guid.NewGuid(),
            DateTimeOffset.UtcNow);

        var exception = Assert.Throws<DomainException>(action);
        Assert.Equal("O tenant é obrigatório.", exception.Message);
    }
}

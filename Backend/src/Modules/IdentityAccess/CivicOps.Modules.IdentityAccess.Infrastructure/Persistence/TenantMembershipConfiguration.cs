using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class TenantMembershipConfiguration
    : IEntityTypeConfiguration<TenantMembership>
{
    public void Configure(EntityTypeBuilder<TenantMembership> builder)
    {
        builder.ToTable("tenant_memberships");
        builder.HasKey(membership => membership.Id);

        builder.Property(membership => membership.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(membership => membership.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();
        builder.Property(membership => membership.UserId)
            .HasColumnName("user_id")
            .IsRequired();
        builder.Property(membership => membership.Role)
            .HasColumnName("role")
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();
        builder.Property(membership => membership.IsActive)
            .HasColumnName("is_active")
            .IsRequired();
        builder.Property(membership => membership.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .IsRequired();
        builder.Property(membership => membership.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();
        builder.Property(membership => membership.UpdatedByUserId)
            .HasColumnName("updated_by_user_id")
            .IsRequired();
        builder.Property(membership => membership.UpdatedAtUtc)
            .HasColumnName("updated_at_utc")
            .IsRequired();

        builder.HasIndex(
                membership => new
                {
                    membership.TenantId,
                    membership.UserId
                })
            .IsUnique()
            .HasDatabaseName("ux_tenant_memberships_tenant_user");
        builder.HasIndex(
                membership => new
                {
                    membership.TenantId,
                    membership.Role,
                    membership.IsActive
                })
            .HasDatabaseName("ix_tenant_memberships_tenant_role_active");
    }
}

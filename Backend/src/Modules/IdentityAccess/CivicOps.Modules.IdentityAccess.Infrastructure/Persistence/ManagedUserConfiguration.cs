using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class ManagedUserConfiguration
    : IEntityTypeConfiguration<ManagedUser>
{
    public void Configure(EntityTypeBuilder<ManagedUser> builder)
    {
        builder.ToTable("managed_users");
        builder.HasKey(user => user.Id);

        builder.Property(user => user.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(user => user.Username)
            .HasColumnName("username")
            .HasMaxLength(80)
            .IsRequired();
        builder.Property(user => user.DisplayName)
            .HasColumnName("display_name")
            .HasMaxLength(160)
            .IsRequired();
        builder.Property(user => user.Email)
            .HasColumnName("email")
            .HasMaxLength(254)
            .IsRequired();
        builder.Property(user => user.TenantId)
            .HasColumnName("tenant_id");
        builder.Property(user => user.IsPlatformAdministrator)
            .HasColumnName("is_platform_administrator")
            .IsRequired();
        builder.Property(user => user.IsActive)
            .HasColumnName("is_active")
            .IsRequired();
        builder.Property(user => user.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .IsRequired();
        builder.Property(user => user.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.HasIndex(user => user.Username)
            .IsUnique()
            .HasDatabaseName("ux_managed_users_username");
        builder.HasIndex(user => new
        {
            user.TenantId,
            user.IsActive
        })
            .HasDatabaseName("ix_managed_users_tenant_active");
        builder.HasIndex(user => new
        {
            user.IsPlatformAdministrator,
            user.IsActive
        })
            .HasDatabaseName("ix_managed_users_platform_admin");
    }
}

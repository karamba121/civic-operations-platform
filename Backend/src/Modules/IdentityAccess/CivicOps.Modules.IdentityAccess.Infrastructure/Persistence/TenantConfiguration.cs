using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class TenantConfiguration
    : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants");
        builder.HasKey(tenant => tenant.Id);

        builder.Property(tenant => tenant.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(tenant => tenant.Name)
            .HasColumnName("name")
            .HasMaxLength(160)
            .IsRequired();
        builder.Property(tenant => tenant.Slug)
            .HasColumnName("slug")
            .HasMaxLength(63)
            .IsRequired();
        builder.Property(tenant => tenant.IsActive)
            .HasColumnName("is_active")
            .IsRequired();
        builder.Property(tenant => tenant.CreatedByUserId)
            .HasColumnName("created_by_user_id")
            .IsRequired();
        builder.Property(tenant => tenant.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();
        builder.Property(tenant => tenant.UpdatedAtUtc)
            .HasColumnName("updated_at_utc")
            .IsRequired();

        builder.HasIndex(tenant => tenant.Slug)
            .IsUnique()
            .HasDatabaseName("ux_tenants_slug");
    }
}

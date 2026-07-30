using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class PlatformAdministrationAuditRecordConfiguration
    : IEntityTypeConfiguration<PlatformAdministrationAuditRecord>
{
    public void Configure(
        EntityTypeBuilder<PlatformAdministrationAuditRecord> builder)
    {
        builder.ToTable("platform_administration_audit");
        builder.HasKey(record => record.Id);

        builder.Property(record => record.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(record => record.ActorUserId)
            .HasColumnName("actor_user_id")
            .IsRequired();
        builder.Property(record => record.TargetTenantId)
            .HasColumnName("target_tenant_id");
        builder.Property(record => record.TargetUserId)
            .HasColumnName("target_user_id");
        builder.Property(record => record.Action)
            .HasColumnName("action")
            .HasMaxLength(120)
            .IsRequired();
        builder.Property(record => record.Data)
            .HasColumnName("data")
            .HasColumnType("jsonb")
            .IsRequired();
        builder.Property(record => record.OccurredAtUtc)
            .HasColumnName("occurred_at_utc")
            .IsRequired();

        builder.HasIndex(record => record.OccurredAtUtc)
            .HasDatabaseName(
                "ix_platform_administration_audit_occurred_at");
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class IdentityAccessAuditRecordConfiguration
    : IEntityTypeConfiguration<IdentityAccessAuditRecord>
{
    public void Configure(
        EntityTypeBuilder<IdentityAccessAuditRecord> builder)
    {
        builder.ToTable("access_audit");
        builder.HasKey(record => record.Id);

        builder.Property(record => record.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(record => record.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();
        builder.Property(record => record.ActorUserId)
            .HasColumnName("actor_user_id")
            .IsRequired();
        builder.Property(record => record.TargetUserId)
            .HasColumnName("target_user_id");
        builder.Property(record => record.Action)
            .HasColumnName("action")
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(record => record.Data)
            .HasColumnName("data")
            .HasColumnType("jsonb")
            .IsRequired();
        builder.Property(record => record.OccurredAtUtc)
            .HasColumnName("occurred_at_utc")
            .IsRequired();

        builder.HasIndex(
                record => new
                {
                    record.TenantId,
                    record.OccurredAtUtc
                })
            .HasDatabaseName("ix_access_audit_tenant_occurred_at");
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Configurations;

internal sealed class RequestAuditRecordConfiguration
    : IEntityTypeConfiguration<RequestAuditRecord>
{
    public void Configure(EntityTypeBuilder<RequestAuditRecord> builder)
    {
        builder.ToTable("request_audit");
        builder.HasKey(record => record.Id);

        builder.Property(record => record.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(record => record.EventId)
            .HasColumnName("event_id")
            .IsRequired();
        builder.Property(record => record.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();
        builder.Property(record => record.RequestId)
            .HasColumnName("request_id")
            .IsRequired();
        builder.Property(record => record.ActorUserId)
            .HasColumnName("actor_user_id")
            .IsRequired();
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

        builder.HasIndex(record => record.EventId)
            .IsUnique()
            .HasDatabaseName("ux_request_audit_event");
        builder.HasIndex(
                record => new
                {
                    record.TenantId,
                    record.RequestId,
                    record.OccurredAtUtc
                })
            .HasDatabaseName("ix_request_audit_tenant_request_occurred_at");
    }
}

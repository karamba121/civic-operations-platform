using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Configurations;

internal sealed class OutboxMessageConfiguration
    : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");
        builder.HasKey(message => message.Id);

        builder.Property(message => message.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(message => message.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();
        builder.Property(message => message.Type)
            .HasColumnName("type")
            .HasMaxLength(200)
            .IsRequired();
        builder.Property(message => message.Payload)
            .HasColumnName("payload")
            .HasColumnType("jsonb")
            .IsRequired();
        builder.Property(message => message.OccurredAtUtc)
            .HasColumnName("occurred_at_utc")
            .IsRequired();
        builder.Property(message => message.NextAttemptAtUtc)
            .HasColumnName("next_attempt_at_utc")
            .IsRequired();
        builder.Property(message => message.ProcessedAtUtc)
            .HasColumnName("processed_at_utc");
        builder.Property(message => message.AttemptCount)
            .HasColumnName("attempt_count")
            .HasDefaultValue(0)
            .IsRequired();
        builder.Property(message => message.LastError)
            .HasColumnName("last_error")
            .HasMaxLength(4_000);
        builder.Property(message => message.LockId)
            .HasColumnName("lock_id");
        builder.Property(message => message.LockedUntilUtc)
            .HasColumnName("locked_until_utc");

        builder.HasIndex(
                message => new
                {
                    message.ProcessedAtUtc,
                    message.NextAttemptAtUtc,
                    message.LockedUntilUtc,
                    message.OccurredAtUtc
                })
            .HasDatabaseName("ix_outbox_pending");
        builder.HasIndex(message => new { message.TenantId, message.OccurredAtUtc })
            .HasDatabaseName("ix_outbox_tenant_occurred_at");
    }
}

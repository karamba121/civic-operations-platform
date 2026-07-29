using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Configurations;

internal sealed class RequestIdempotencyRecordConfiguration
    : IEntityTypeConfiguration<RequestIdempotencyRecord>
{
    public void Configure(EntityTypeBuilder<RequestIdempotencyRecord> builder)
    {
        builder.ToTable("request_idempotency");

        builder.HasKey(record => new { record.TenantId, record.Key });

        builder.Property(record => record.TenantId)
            .HasColumnName("tenant_id");

        builder.Property(record => record.Key)
            .HasColumnName("idempotency_key")
            .HasMaxLength(128);

        builder.Property(record => record.RequestHash)
            .HasColumnName("request_hash")
            .HasMaxLength(64)
            .IsFixedLength();

        builder.Property(record => record.RequestId)
            .HasColumnName("request_id");

        builder.Property(record => record.CreatedAtUtc)
            .HasColumnName("created_at_utc");

        builder.HasIndex(record => new { record.TenantId, record.RequestId })
            .HasDatabaseName("ix_request_idempotency_tenant_request");
    }
}

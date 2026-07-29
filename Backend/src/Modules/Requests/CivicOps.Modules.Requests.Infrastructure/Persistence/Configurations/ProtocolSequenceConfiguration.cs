using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Configurations;

internal sealed class ProtocolSequenceConfiguration
    : IEntityTypeConfiguration<ProtocolSequence>
{
    public void Configure(EntityTypeBuilder<ProtocolSequence> builder)
    {
        builder.ToTable("protocol_sequences");

        builder.HasKey(sequence => new { sequence.TenantId, sequence.Year });

        builder.Property(sequence => sequence.TenantId)
            .HasColumnName("tenant_id");

        builder.Property(sequence => sequence.Year)
            .HasColumnName("year");

        builder.Property(sequence => sequence.LastValue)
            .HasColumnName("last_value")
            .IsRequired();

        builder.ToTable(table =>
            table.HasCheckConstraint(
                "ck_protocol_sequences_last_value_positive",
                "last_value > 0"));
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Notifications.Infrastructure.Persistence.Configurations;

internal sealed class ProcessedMessageConfiguration
    : IEntityTypeConfiguration<ProcessedMessage>
{
    public void Configure(EntityTypeBuilder<ProcessedMessage> builder)
    {
        builder.ToTable("processed_messages");
        builder.HasKey(message => message.MessageId);

        builder.Property(message => message.MessageId)
            .HasColumnName("message_id")
            .ValueGeneratedNever();
        builder.Property(message => message.MessageType)
            .HasColumnName("message_type")
            .HasMaxLength(200)
            .IsRequired();
        builder.Property(message => message.ProcessedAtUtc)
            .HasColumnName("processed_at_utc")
            .IsRequired();
    }
}

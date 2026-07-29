using CivicOps.Modules.Notifications.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Notifications.Infrastructure.Persistence.Configurations;

internal sealed class NotificationConfiguration
    : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(notification => notification.Id);
        builder.Ignore(notification => notification.DomainEvents);

        builder.Property(notification => notification.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(notification => notification.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();
        builder.Property(notification => notification.SourceMessageId)
            .HasColumnName("source_message_id")
            .IsRequired();
        builder.Property(notification => notification.RecipientUserId)
            .HasColumnName("recipient_user_id")
            .IsRequired();
        builder.Property(notification => notification.RequestId)
            .HasColumnName("request_id")
            .IsRequired();
        builder.Property(notification => notification.ProtocolNumber)
            .HasColumnName("protocol_number")
            .HasMaxLength(32)
            .IsRequired();
        builder.Property(notification => notification.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(100)
            .IsRequired();
        builder.Property(notification => notification.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();
        builder.Property(notification => notification.Content)
            .HasColumnName("content")
            .HasMaxLength(2_000)
            .IsRequired();
        builder.Property(notification => notification.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.HasIndex(
                notification => new
                {
                    notification.TenantId,
                    notification.RecipientUserId,
                    notification.CreatedAtUtc
                })
            .HasDatabaseName("ix_notifications_tenant_recipient_created_at");
        builder.HasIndex(
                notification => new
                {
                    notification.TenantId,
                    notification.RequestId
                })
            .HasDatabaseName("ix_notifications_tenant_request");
        builder.HasIndex(notification => notification.SourceMessageId)
            .IsUnique()
            .HasDatabaseName("ux_notifications_source_message");
    }
}

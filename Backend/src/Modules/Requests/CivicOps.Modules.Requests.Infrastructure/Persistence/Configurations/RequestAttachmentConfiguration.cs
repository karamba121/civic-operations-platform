using CivicOps.Modules.Requests.Domain.Requests;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Configurations;

internal sealed class RequestAttachmentConfiguration :
    IEntityTypeConfiguration<RequestAttachment>
{
    public void Configure(
        EntityTypeBuilder<RequestAttachment> builder)
    {
        builder.ToTable("request_attachments");
        builder.HasKey(attachment => attachment.Id);

        builder.Property(attachment => attachment.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();
        builder.Property(attachment => attachment.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();
        builder.Property(attachment => attachment.RequestId)
            .HasColumnName("request_id")
            .IsRequired();
        builder.Property(attachment => attachment.UploadedByUserId)
            .HasColumnName("uploaded_by_user_id")
            .IsRequired();
        builder.Property(attachment => attachment.FileName)
            .HasColumnName("file_name")
            .HasMaxLength(RequestAttachment.FileNameMaxLength)
            .IsRequired();
        builder.Property(attachment => attachment.ContentType)
            .HasColumnName("content_type")
            .HasMaxLength(RequestAttachment.ContentTypeMaxLength)
            .IsRequired();
        builder.Property(attachment => attachment.SizeBytes)
            .HasColumnName("size_bytes")
            .IsRequired();
        builder.Property(attachment => attachment.StorageKey)
            .HasColumnName("storage_key")
            .HasMaxLength(RequestAttachment.StorageKeyMaxLength)
            .IsRequired();
        builder.Property(attachment => attachment.Sha256)
            .HasColumnName("sha256")
            .HasMaxLength(RequestAttachment.Sha256Length)
            .IsFixedLength()
            .IsRequired();
        builder.Property(attachment => attachment.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.HasOne<Request>()
            .WithMany()
            .HasForeignKey(attachment => new
            {
                attachment.TenantId,
                attachment.RequestId
            })
            .HasPrincipalKey(request => new
            {
                request.TenantId,
                request.Id
            })
            .HasConstraintName(
                "fk_request_attachments_tenant_request")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(attachment => attachment.StorageKey)
            .IsUnique()
            .HasDatabaseName(
                "ux_request_attachments_storage_key");
        builder.HasIndex(attachment => new
        {
            attachment.TenantId,
            attachment.RequestId,
            attachment.CreatedAtUtc
        })
            .HasDatabaseName(
                "ix_request_attachments_tenant_request_created_at");
    }
}

using CivicOps.Modules.Requests.Domain.Requests;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Configurations;

internal sealed class RequestCommentConfiguration
    : IEntityTypeConfiguration<RequestComment>
{
    public void Configure(EntityTypeBuilder<RequestComment> builder)
    {
        builder.ToTable("request_comments");

        builder.HasKey(comment => comment.Id);

        builder.Property(comment => comment.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(comment => comment.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();

        builder.Property(comment => comment.RequestId)
            .HasColumnName("request_id")
            .IsRequired();

        builder.Property(comment => comment.AuthorUserId)
            .HasColumnName("author_user_id")
            .IsRequired();

        builder.Property(comment => comment.Content)
            .HasColumnName("content")
            .HasMaxLength(2_000)
            .IsRequired();

        builder.Property(comment => comment.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.HasOne<Request>()
            .WithMany()
            .HasForeignKey(comment => new { comment.TenantId, comment.RequestId })
            .HasPrincipalKey(request => new { request.TenantId, request.Id })
            .HasConstraintName("fk_request_comments_tenant_request")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(
                comment => new
                {
                    comment.TenantId,
                    comment.RequestId,
                    comment.CreatedAtUtc
                })
            .HasDatabaseName("ix_request_comments_tenant_request_created_at");
    }
}

using CivicOps.Modules.Requests.Domain.Requests;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Configurations;

internal sealed class RequestConfiguration : IEntityTypeConfiguration<Request>
{
    public void Configure(EntityTypeBuilder<Request> builder)
    {
        builder.ToTable("administrative_requests");

        builder.HasKey(request => request.Id);

        builder.Property(request => request.Id)
            .HasColumnName("id")
            .ValueGeneratedNever();

        builder.Property(request => request.TenantId)
            .HasColumnName("tenant_id")
            .IsRequired();

        builder.Property(request => request.ProtocolNumber)
            .HasConversion(
                protocolNumber => protocolNumber.Value,
                value => ProtocolNumber.From(value))
            .HasColumnName("protocol_number")
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(request => request.Title)
            .HasColumnName("title")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(request => request.Description)
            .HasColumnName("description")
            .HasMaxLength(4_000)
            .IsRequired();

        builder.Property(request => request.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(request => request.ResponsibleUserId)
            .HasColumnName("responsible_user_id");

        builder.Property(request => request.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(request => request.Version)
            .HasColumnName("version")
            .IsConcurrencyToken()
            .IsRequired();

        builder.HasIndex(request => new { request.TenantId, request.ProtocolNumber })
            .IsUnique()
            .HasDatabaseName("ux_administrative_requests_tenant_protocol");

        builder.HasIndex(request => new { request.TenantId, request.CreatedAtUtc })
            .HasDatabaseName("ix_administrative_requests_tenant_created_at");

        builder.HasIndex(
                request => new
                {
                    request.TenantId,
                    request.Status,
                    request.CreatedAtUtc
                })
            .HasDatabaseName("ix_administrative_requests_tenant_status_created_at");

        builder.HasIndex(
                request => new
                {
                    request.TenantId,
                    request.ResponsibleUserId,
                    request.Status,
                    request.CreatedAtUtc
                })
            .HasDatabaseName(
                "ix_administrative_requests_tenant_responsible_status_created_at");
    }
}

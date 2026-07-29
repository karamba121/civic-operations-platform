using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestResponsible : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "responsible_user_id",
                schema: "requests",
                table: "administrative_requests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_administrative_requests_tenant_responsible_status_created_at",
                schema: "requests",
                table: "administrative_requests",
                columns: new[] { "tenant_id", "responsible_user_id", "status", "created_at_utc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_administrative_requests_tenant_responsible_status_created_at",
                schema: "requests",
                table: "administrative_requests");

            migrationBuilder.DropColumn(
                name: "responsible_user_id",
                schema: "requests",
                table: "administrative_requests");
        }
    }
}

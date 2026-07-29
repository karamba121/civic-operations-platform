using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestCommentsAndDueDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "due_date_utc",
                schema: "requests",
                table: "administrative_requests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "ak_administrative_requests_tenant_id",
                schema: "requests",
                table: "administrative_requests",
                columns: new[] { "tenant_id", "id" });

            migrationBuilder.CreateTable(
                name: "request_comments",
                schema: "requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_request_comments", x => x.id);
                    table.ForeignKey(
                        name: "fk_request_comments_tenant_request",
                        columns: x => new { x.tenant_id, x.request_id },
                        principalSchema: "requests",
                        principalTable: "administrative_requests",
                        principalColumns: new[] { "tenant_id", "id" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_administrative_requests_tenant_due_date",
                schema: "requests",
                table: "administrative_requests",
                columns: new[] { "tenant_id", "due_date_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_request_comments_tenant_request_created_at",
                schema: "requests",
                table: "request_comments",
                columns: new[] { "tenant_id", "request_id", "created_at_utc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "request_comments",
                schema: "requests");

            migrationBuilder.DropUniqueConstraint(
                name: "ak_administrative_requests_tenant_id",
                schema: "requests",
                table: "administrative_requests");

            migrationBuilder.DropIndex(
                name: "ix_administrative_requests_tenant_due_date",
                schema: "requests",
                table: "administrative_requests");

            migrationBuilder.DropColumn(
                name: "due_date_utc",
                schema: "requests",
                table: "administrative_requests");
        }
    }
}

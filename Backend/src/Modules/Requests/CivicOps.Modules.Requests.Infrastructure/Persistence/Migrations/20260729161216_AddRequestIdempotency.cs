using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestIdempotency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "request_idempotency",
                schema: "requests",
                columns: table => new
                {
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    idempotency_key = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    request_hash = table.Column<string>(type: "character(64)", fixedLength: true, maxLength: 64, nullable: false),
                    request_id = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_request_idempotency", x => new { x.tenant_id, x.idempotency_key });
                });

            migrationBuilder.CreateIndex(
                name: "ix_request_idempotency_tenant_request",
                schema: "requests",
                table: "request_idempotency",
                columns: new[] { "tenant_id", "request_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "request_idempotency",
                schema: "requests");
        }
    }
}

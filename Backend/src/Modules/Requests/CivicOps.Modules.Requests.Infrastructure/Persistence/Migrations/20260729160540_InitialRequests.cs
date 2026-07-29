using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "requests");

            migrationBuilder.CreateTable(
                name: "administrative_requests",
                schema: "requests",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    protocol_number = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_administrative_requests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "protocol_sequences",
                schema: "requests",
                columns: table => new
                {
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    last_value = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_protocol_sequences", x => new { x.tenant_id, x.year });
                    table.CheckConstraint("ck_protocol_sequences_last_value_positive", "last_value > 0");
                });

            migrationBuilder.CreateIndex(
                name: "ix_administrative_requests_tenant_created_at",
                schema: "requests",
                table: "administrative_requests",
                columns: new[] { "tenant_id", "created_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ux_administrative_requests_tenant_protocol",
                schema: "requests",
                table: "administrative_requests",
                columns: new[] { "tenant_id", "protocol_number" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "administrative_requests",
                schema: "requests");

            migrationBuilder.DropTable(
                name: "protocol_sequences",
                schema: "requests");
        }
    }
}

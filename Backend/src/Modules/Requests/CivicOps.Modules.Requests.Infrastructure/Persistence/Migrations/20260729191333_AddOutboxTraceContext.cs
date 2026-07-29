using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOutboxTraceContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "baggage",
                schema: "requests",
                table: "outbox_messages",
                type: "character varying(4096)",
                maxLength: 4096,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "trace_parent",
                schema: "requests",
                table: "outbox_messages",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "trace_state",
                schema: "requests",
                table: "outbox_messages",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "baggage",
                schema: "requests",
                table: "outbox_messages");

            migrationBuilder.DropColumn(
                name: "trace_parent",
                schema: "requests",
                table: "outbox_messages");

            migrationBuilder.DropColumn(
                name: "trace_state",
                schema: "requests",
                table: "outbox_messages");
        }
    }
}

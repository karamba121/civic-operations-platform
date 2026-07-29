using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOutboxPublisherLease : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_outbox_pending",
                schema: "requests",
                table: "outbox_messages");

            migrationBuilder.AddColumn<Guid>(
                name: "lock_id",
                schema: "requests",
                table: "outbox_messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "locked_until_utc",
                schema: "requests",
                table: "outbox_messages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_outbox_pending",
                schema: "requests",
                table: "outbox_messages",
                columns: new[] { "processed_at_utc", "next_attempt_at_utc", "locked_until_utc", "occurred_at_utc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_outbox_pending",
                schema: "requests",
                table: "outbox_messages");

            migrationBuilder.DropColumn(
                name: "lock_id",
                schema: "requests",
                table: "outbox_messages");

            migrationBuilder.DropColumn(
                name: "locked_until_utc",
                schema: "requests",
                table: "outbox_messages");

            migrationBuilder.CreateIndex(
                name: "ix_outbox_pending",
                schema: "requests",
                table: "outbox_messages",
                columns: new[] { "processed_at_utc", "next_attempt_at_utc", "occurred_at_utc" });
        }
    }
}

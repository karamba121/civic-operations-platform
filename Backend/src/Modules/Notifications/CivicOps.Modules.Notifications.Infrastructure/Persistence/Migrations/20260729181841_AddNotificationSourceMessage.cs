using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Notifications.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationSourceMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "source_message_id",
                schema: "notifications",
                table: "notifications",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE notifications.notifications
                   SET source_message_id = id
                 WHERE source_message_id IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "source_message_id",
                schema: "notifications",
                table: "notifications",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "ux_notifications_source_message",
                schema: "notifications",
                table: "notifications",
                column: "source_message_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ux_notifications_source_message",
                schema: "notifications",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "source_message_id",
                schema: "notifications",
                table: "notifications");
        }
    }
}

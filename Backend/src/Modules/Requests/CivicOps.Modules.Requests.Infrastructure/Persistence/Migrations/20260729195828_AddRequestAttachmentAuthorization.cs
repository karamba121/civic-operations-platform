using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestAttachmentAuthorization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "created_by_user_id",
                schema: "requests",
                table: "administrative_requests",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE requests.administrative_requests AS request
                SET created_by_user_id = creation.actor_user_id
                FROM (
                    SELECT DISTINCT ON (request_id)
                        request_id,
                        actor_user_id
                    FROM requests.request_audit
                    WHERE action = 'RequestCreated'
                    ORDER BY request_id, occurred_at_utc
                ) AS creation
                WHERE creation.request_id = request.id;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_by_user_id",
                schema: "requests",
                table: "administrative_requests");
        }
    }
}

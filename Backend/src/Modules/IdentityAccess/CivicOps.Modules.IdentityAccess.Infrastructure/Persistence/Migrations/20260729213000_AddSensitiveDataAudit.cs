using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence.Migrations;

[DbContext(typeof(IdentityAccessDbContext))]
[Migration("20260729213000_AddSensitiveDataAudit")]
public sealed class AddSensitiveDataAudit : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "access_audit",
            schema: "identity_access",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                actor_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                target_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                action = table.Column<string>(
                    type: "character varying(100)",
                    maxLength: 100,
                    nullable: false),
                data = table.Column<string>(
                    type: "jsonb",
                    nullable: false),
                occurred_at_utc = table.Column<DateTimeOffset>(
                    type: "timestamp with time zone",
                    nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_access_audit", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_access_audit_tenant_occurred_at",
            schema: "identity_access",
            table: "access_audit",
            columns: new[] { "tenant_id", "occurred_at_utc" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "access_audit",
            schema: "identity_access");
    }
}

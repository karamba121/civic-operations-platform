using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformTenantAdministration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "managed_users",
                schema: "identity_access",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    display_name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_platform_administrator = table.Column<bool>(type: "boolean", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_managed_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "platform_administration_audit",
                schema: "identity_access",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_tenant_id = table.Column<Guid>(type: "uuid", nullable: true),
                    target_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    action = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    data = table.Column<string>(type: "jsonb", nullable: false),
                    occurred_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_platform_administration_audit", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "tenants",
                schema: "identity_access",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    slug = table.Column<string>(type: "character varying(63)", maxLength: 63, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenants", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_managed_users_platform_admin",
                schema: "identity_access",
                table: "managed_users",
                columns: new[] { "is_platform_administrator", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_managed_users_tenant_active",
                schema: "identity_access",
                table: "managed_users",
                columns: new[] { "tenant_id", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ux_managed_users_username",
                schema: "identity_access",
                table: "managed_users",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_platform_administration_audit_occurred_at",
                schema: "identity_access",
                table: "platform_administration_audit",
                column: "occurred_at_utc");

            migrationBuilder.CreateIndex(
                name: "ux_tenants_slug",
                schema: "identity_access",
                table: "tenants",
                column: "slug",
                unique: true);
            migrationBuilder.InsertData(
                schema: "identity_access",
                table: "managed_users",
                columns: new[]
                {
                    "id",
                    "username",
                    "display_name",
                    "email",
                    "tenant_id",
                    "is_platform_administrator",
                    "is_active",
                    "created_by_user_id",
                    "created_at_utc"
                },
                values: new object[]
                {
                    new Guid("33333333-3333-3333-3333-333333333333"),
                    "admin",
                    "Administrador da Plataforma",
                    "admin@civicops.local",
                    null,
                    true,
                    true,
                    new Guid("33333333-3333-3333-3333-333333333333"),
                    new DateTimeOffset(
                        2026,
                        7,
                        30,
                        0,
                        0,
                        0,
                        TimeSpan.Zero)
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "managed_users",
                schema: "identity_access");

            migrationBuilder.DropTable(
                name: "platform_administration_audit",
                schema: "identity_access");

            migrationBuilder.DropTable(
                name: "tenants",
                schema: "identity_access");
        }
    }
}

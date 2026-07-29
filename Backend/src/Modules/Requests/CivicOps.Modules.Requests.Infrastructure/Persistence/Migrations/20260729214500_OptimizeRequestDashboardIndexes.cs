using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CivicOps.Modules.Requests.Infrastructure.Persistence.Migrations;

[DbContext(typeof(RequestsDbContext))]
[Migration("20260729214500_OptimizeRequestDashboardIndexes")]
public sealed class OptimizeRequestDashboardIndexes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_administrative_requests_tenant_due_date",
            schema: "requests",
            table: "administrative_requests");

        migrationBuilder.Sql(
            """
            CREATE INDEX ix_administrative_requests_tenant_active_due_date
                ON requests.administrative_requests
                    (tenant_id, due_date_utc)
                INCLUDE (responsible_user_id)
                WHERE status = 'Submitted' OR status = 'InProgress';
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_administrative_requests_tenant_active_due_date",
            schema: "requests",
            table: "administrative_requests");

        migrationBuilder.CreateIndex(
            name: "ix_administrative_requests_tenant_due_date",
            schema: "requests",
            table: "administrative_requests",
            columns: new[] { "tenant_id", "due_date_utc" });
    }
}

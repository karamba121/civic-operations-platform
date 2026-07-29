using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

public sealed class IdentityAccessDbContext(
    DbContextOptions<IdentityAccessDbContext> options) : DbContext(options)
{
    public DbSet<TenantMembership> TenantMemberships =>
        Set<TenantMembership>();

    internal DbSet<IdentityAccessAuditRecord> AuditRecords =>
        Set<IdentityAccessAuditRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity_access");
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(IdentityAccessDbContext).Assembly);
    }
}

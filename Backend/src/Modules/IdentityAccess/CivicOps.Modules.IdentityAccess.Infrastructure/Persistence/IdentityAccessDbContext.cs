using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

public sealed class IdentityAccessDbContext(
    DbContextOptions<IdentityAccessDbContext> options) : DbContext(options)
{
    public DbSet<TenantMembership> TenantMemberships =>
        Set<TenantMembership>();

    public DbSet<Tenant> Tenants => Set<Tenant>();

    public DbSet<ManagedUser> ManagedUsers => Set<ManagedUser>();

    internal DbSet<IdentityAccessAuditRecord> AuditRecords =>
        Set<IdentityAccessAuditRecord>();

    internal DbSet<PlatformAdministrationAuditRecord>
        PlatformAdministrationAuditRecords =>
            Set<PlatformAdministrationAuditRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity_access");
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(IdentityAccessDbContext).Assembly);
    }
}

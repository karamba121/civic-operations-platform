using CivicOps.Modules.Requests.Domain.Requests;
using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

public sealed class RequestsDbContext(DbContextOptions<RequestsDbContext> options)
    : DbContext(options)
{
    public DbSet<Request> Requests => Set<Request>();

    public DbSet<RequestComment> RequestComments => Set<RequestComment>();

    internal DbSet<RequestAuditRecord> RequestAudit => Set<RequestAuditRecord>();

    internal DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("requests");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RequestsDbContext).Assembly);
    }
}

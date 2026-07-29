using CivicOps.Modules.Requests.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestSensitiveDataAudit(
    RequestsDbContext dbContext) : IRequestSensitiveDataAudit
{
    public async Task RecordAsync(
        Guid tenantId,
        Guid requestId,
        Guid actorUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc,
        CancellationToken cancellationToken)
    {
        dbContext.RequestAudit.Add(
            RequestAuditRecord.Create(
                Guid.CreateVersion7(),
                tenantId,
                requestId,
                actorUserId,
                action,
                data,
                occurredAtUtc));

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}

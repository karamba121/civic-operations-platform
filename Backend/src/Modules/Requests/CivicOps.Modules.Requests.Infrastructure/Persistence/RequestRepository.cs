using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;
using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestRepository(RequestsDbContext dbContext) : IRequestRepository
{
    public void Add(Request request)
    {
        dbContext.Requests.Add(request);
    }

    public Task<Request?> GetAsync(
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        return dbContext.Requests.SingleOrDefaultAsync(
            request => request.TenantId == tenantId && request.Id == requestId,
            cancellationToken);
    }
}

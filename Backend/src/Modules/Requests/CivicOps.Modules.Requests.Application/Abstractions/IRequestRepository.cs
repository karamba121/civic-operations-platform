using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestRepository
{
    void Add(Request request);

    Task<Request?> GetAsync(
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken);
}

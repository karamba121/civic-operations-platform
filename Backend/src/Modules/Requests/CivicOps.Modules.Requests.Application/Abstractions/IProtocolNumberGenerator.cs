using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IProtocolNumberGenerator
{
    Task<ProtocolNumber> NextAsync(
        Guid tenantId,
        int year,
        CancellationToken cancellationToken);
}

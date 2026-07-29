using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.GetRequestDetails;

public sealed class GetRequestDetailsHandler(IRequestReadService readService)
{
    public Task<RequestDetailsResult?> HandleAsync(
        GetRequestDetailsQuery query,
        CancellationToken cancellationToken)
    {
        return readService.GetDetailsAsync(
            query.TenantId,
            query.RequestId,
            cancellationToken);
    }
}

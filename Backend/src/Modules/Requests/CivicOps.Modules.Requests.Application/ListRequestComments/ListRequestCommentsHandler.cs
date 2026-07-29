using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.ListRequestComments;

public sealed class ListRequestCommentsHandler(IRequestReadService readService)
{
    public Task<PagedRequestCommentsResult?> HandleAsync(
        ListRequestCommentsQuery query,
        CancellationToken cancellationToken)
    {
        return readService.ListCommentsAsync(query, cancellationToken);
    }
}

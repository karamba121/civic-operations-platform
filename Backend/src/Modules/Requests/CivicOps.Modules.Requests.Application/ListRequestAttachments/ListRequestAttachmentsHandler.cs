using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.ListRequestAttachments;

public sealed class ListRequestAttachmentsHandler(
    IRequestAttachmentReadService readService)
{
    public Task<IReadOnlyCollection<RequestAttachmentListItem>?> HandleAsync(
        ListRequestAttachmentsQuery query,
        CancellationToken cancellationToken)
    {
        return readService.ListAsync(
            query.TenantId,
            query.RequestId,
            cancellationToken);
    }
}

using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.ListRequestAttachments;

public sealed class ListRequestAttachmentsHandler(
    IRequestRepository requestRepository,
    RequestAttachmentAuthorization authorization,
    IRequestAttachmentReadService readService)
{
    public async Task<IReadOnlyCollection<RequestAttachmentListItem>?> HandleAsync(
        ListRequestAttachmentsQuery query,
        CancellationToken cancellationToken)
    {
        var request = await requestRepository.GetAsync(
            query.TenantId,
            query.RequestId,
            cancellationToken);

        if (request is null)
        {
            return null;
        }

        await authorization.EnsureCanReadAsync(
            request,
            query.UserId,
            cancellationToken);

        return await readService.ListAsync(
            query.TenantId,
            query.RequestId,
            cancellationToken);
    }
}

using CivicOps.Modules.Requests.Application.Abstractions;
using System.Text.Json;

namespace CivicOps.Modules.Requests.Application.ListRequestAttachments;

public sealed class ListRequestAttachmentsHandler(
    IRequestRepository requestRepository,
    RequestAttachmentAuthorization authorization,
    IRequestAttachmentReadService readService,
    IRequestSensitiveDataAudit audit,
    TimeProvider timeProvider)
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

        var attachments = await readService.ListAsync(
            query.TenantId,
            query.RequestId,
            cancellationToken);
        if (attachments is null)
        {
            return null;
        }

        await audit.RecordAsync(
            query.TenantId,
            query.RequestId,
            query.UserId,
            RequestSensitiveDataAuditActions.AttachmentMetadataListed,
            JsonSerializer.Serialize(new { count = attachments.Count }),
            timeProvider.GetUtcNow(),
            cancellationToken);

        return attachments;
    }
}

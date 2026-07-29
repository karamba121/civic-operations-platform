using CivicOps.Modules.Requests.Application.Abstractions;
using System.Text.Json;

namespace CivicOps.Modules.Requests.Application.DownloadRequestAttachment;

public sealed class DownloadRequestAttachmentHandler(
    IRequestRepository requestRepository,
    RequestAttachmentAuthorization authorization,
    IRequestAttachmentReadService readService,
    IAttachmentContentStore contentStore,
    IRequestSensitiveDataAudit audit,
    TimeProvider timeProvider)
{
    public async Task<DownloadRequestAttachmentResult?> HandleAsync(
        DownloadRequestAttachmentQuery query,
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

        var attachment = await readService.GetAsync(
            query.TenantId,
            query.RequestId,
            query.AttachmentId,
            cancellationToken);

        if (attachment is null)
        {
            return null;
        }

        var content = await contentStore.OpenReadAsync(
            attachment.StorageKey,
            cancellationToken)
            ?? throw new AttachmentContentUnavailableException(
                attachment.Id);

        try
        {
            await audit.RecordAsync(
                query.TenantId,
                query.RequestId,
                query.UserId,
                RequestSensitiveDataAuditActions.AttachmentDownloaded,
                JsonSerializer.Serialize(
                    new { attachmentId = attachment.Id }),
                timeProvider.GetUtcNow(),
                cancellationToken);

            return new DownloadRequestAttachmentResult(
                content,
                attachment.FileName,
                attachment.ContentType,
                attachment.SizeBytes);
        }
        catch
        {
            await content.DisposeAsync();
            throw;
        }
    }
}

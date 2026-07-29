using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.DownloadRequestAttachment;

public sealed class DownloadRequestAttachmentHandler(
    IRequestAttachmentReadService readService,
    IAttachmentContentStore contentStore)
{
    public async Task<DownloadRequestAttachmentResult?> HandleAsync(
        DownloadRequestAttachmentQuery query,
        CancellationToken cancellationToken)
    {
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

        return new DownloadRequestAttachmentResult(
            content,
            attachment.FileName,
            attachment.ContentType,
            attachment.SizeBytes);
    }
}

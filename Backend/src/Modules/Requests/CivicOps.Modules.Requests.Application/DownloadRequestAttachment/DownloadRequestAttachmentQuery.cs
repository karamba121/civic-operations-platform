namespace CivicOps.Modules.Requests.Application.DownloadRequestAttachment;

public sealed record DownloadRequestAttachmentQuery(
    Guid TenantId,
    Guid RequestId,
    Guid AttachmentId);

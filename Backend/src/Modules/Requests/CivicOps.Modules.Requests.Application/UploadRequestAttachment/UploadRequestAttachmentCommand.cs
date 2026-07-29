namespace CivicOps.Modules.Requests.Application.UploadRequestAttachment;

public sealed record UploadRequestAttachmentCommand(
    Guid TenantId,
    Guid RequestId,
    Guid UploadedByUserId,
    string FileName,
    string ContentType,
    Stream Content);

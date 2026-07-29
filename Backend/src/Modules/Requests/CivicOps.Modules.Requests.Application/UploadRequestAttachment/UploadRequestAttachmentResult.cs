namespace CivicOps.Modules.Requests.Application.UploadRequestAttachment;

public sealed record UploadRequestAttachmentResult(
    Guid Id,
    Guid RequestId,
    Guid UploadedByUserId,
    string FileName,
    string ContentType,
    long SizeBytes,
    string Sha256,
    DateTimeOffset CreatedAtUtc);

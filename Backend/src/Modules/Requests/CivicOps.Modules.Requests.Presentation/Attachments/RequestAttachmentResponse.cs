namespace CivicOps.Modules.Requests.Presentation.Attachments;

public sealed record RequestAttachmentResponse(
    Guid Id,
    Guid UploadedByUserId,
    string FileName,
    string ContentType,
    long SizeBytes,
    string Sha256,
    DateTimeOffset CreatedAtUtc);

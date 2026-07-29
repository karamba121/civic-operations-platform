namespace CivicOps.Modules.Requests.Application.ListRequestAttachments;

public sealed record RequestAttachmentListItem(
    Guid Id,
    Guid UploadedByUserId,
    string FileName,
    string ContentType,
    long SizeBytes,
    string Sha256,
    DateTimeOffset CreatedAtUtc);

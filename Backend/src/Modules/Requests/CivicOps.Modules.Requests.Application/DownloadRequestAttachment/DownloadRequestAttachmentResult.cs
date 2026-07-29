namespace CivicOps.Modules.Requests.Application.DownloadRequestAttachment;

public sealed record DownloadRequestAttachmentResult(
    Stream Content,
    string FileName,
    string ContentType,
    long SizeBytes);

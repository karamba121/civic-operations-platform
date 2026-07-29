using CivicOps.Modules.Requests.Application.ListRequestAttachments;

namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestAttachmentReadService
{
    Task<IReadOnlyCollection<RequestAttachmentListItem>?> ListAsync(
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken);

    Task<RequestAttachmentContentDescriptor?> GetAsync(
        Guid tenantId,
        Guid requestId,
        Guid attachmentId,
        CancellationToken cancellationToken);
}

public sealed record RequestAttachmentContentDescriptor(
    Guid Id,
    string FileName,
    string ContentType,
    long SizeBytes,
    string StorageKey);

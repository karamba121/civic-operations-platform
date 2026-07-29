namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IAttachmentContentStore
{
    Task<StoredAttachmentContent> SaveAsync(
        string storageKey,
        Stream content,
        CancellationToken cancellationToken);

    Task<Stream?> OpenReadAsync(
        string storageKey,
        CancellationToken cancellationToken);

    Task DeleteIfExistsAsync(
        string storageKey,
        CancellationToken cancellationToken);
}

public sealed record StoredAttachmentContent(
    long SizeBytes,
    string Sha256);

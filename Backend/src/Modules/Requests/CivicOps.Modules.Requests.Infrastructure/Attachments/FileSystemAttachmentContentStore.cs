using CivicOps.Modules.Requests.Application;
using CivicOps.Modules.Requests.Application.Abstractions;
using System.Buffers;
using System.Security.Cryptography;

namespace CivicOps.Modules.Requests.Infrastructure.Attachments;

internal sealed class FileSystemAttachmentContentStore(
    AttachmentStorageOptions options) : IAttachmentContentStore
{
    private const int BufferSize = 81_920;
    private readonly string _rootPath =
        Path.GetFullPath(options.RootPath);

    public async Task<StoredAttachmentContent> SaveAsync(
        string storageKey,
        ValidatedAttachmentType attachmentType,
        Stream content,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(storageKey);
        ArgumentNullException.ThrowIfNull(content);

        var destinationPath = ResolvePath(storageKey);
        var destinationDirectory =
            Path.GetDirectoryName(destinationPath)
            ?? throw new InvalidOperationException(
                "O diretório do anexo é inválido.");
        Directory.CreateDirectory(destinationDirectory);
        var temporaryPath =
            $"{destinationPath}.upload-{Guid.NewGuid():N}";
        var buffer = ArrayPool<byte>.Shared.Rent(BufferSize);
        var contentPrefix = new byte[8];
        var contentPrefixLength = 0;

        try
        {
            using var hash =
                IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            long sizeBytes = 0;

            await using (var destination = new FileStream(
                             temporaryPath,
                             new FileStreamOptions
                             {
                                 Mode = FileMode.CreateNew,
                                 Access = FileAccess.Write,
                                 Share = FileShare.None,
                                 Options = FileOptions.Asynchronous |
                                     FileOptions.SequentialScan
                             }))
            {
                while (true)
                {
                    var read = await content.ReadAsync(
                        buffer.AsMemory(0, BufferSize),
                        cancellationToken);

                    if (read == 0)
                    {
                        break;
                    }

                    sizeBytes = checked(sizeBytes + read);

                    if (sizeBytes > options.MaximumSizeBytes)
                    {
                        throw new AttachmentContentTooLargeException(
                            options.MaximumSizeBytes);
                    }

                    if (contentPrefixLength < contentPrefix.Length)
                    {
                        var bytesToCopy = Math.Min(
                            read,
                            contentPrefix.Length - contentPrefixLength);
                        buffer.AsSpan(0, bytesToCopy).CopyTo(
                            contentPrefix.AsSpan(contentPrefixLength));
                        contentPrefixLength += bytesToCopy;
                    }

                    hash.AppendData(buffer, 0, read);
                    await destination.WriteAsync(
                        buffer.AsMemory(0, read),
                        cancellationToken);
                }

                await destination.FlushAsync(cancellationToken);
            }

            if (!AttachmentFilePolicy.HasValidSignature(
                    attachmentType.Type,
                    contentPrefix.AsSpan(0, contentPrefixLength)))
            {
                throw new AttachmentContentTypeNotAllowedException(
                    "A assinatura do conteúdo não corresponde ao tipo de arquivo informado.");
            }

            File.Move(
                temporaryPath,
                destinationPath,
                overwrite: false);

            return new StoredAttachmentContent(
                sizeBytes,
                Convert.ToHexString(
                    hash.GetHashAndReset())
                    .ToLowerInvariant());
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);

            if (File.Exists(temporaryPath))
            {
                File.Delete(temporaryPath);
            }
        }
    }

    public Task<Stream?> OpenReadAsync(
        string storageKey,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var path = ResolvePath(storageKey);

        try
        {
            Stream stream = new FileStream(
                path,
                new FileStreamOptions
                {
                    Mode = FileMode.Open,
                    Access = FileAccess.Read,
                    Share = FileShare.Read,
                    Options = FileOptions.Asynchronous |
                        FileOptions.SequentialScan
                });
            return Task.FromResult<Stream?>(stream);
        }
        catch (FileNotFoundException)
        {
            return Task.FromResult<Stream?>(null);
        }
        catch (DirectoryNotFoundException)
        {
            return Task.FromResult<Stream?>(null);
        }
    }

    public Task DeleteIfExistsAsync(
        string storageKey,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var path = ResolvePath(storageKey);
        File.Delete(path);
        return Task.CompletedTask;
    }

    private string ResolvePath(string storageKey)
    {
        var relativePath = storageKey.Replace(
            '/',
            Path.DirectorySeparatorChar);
        var path = Path.GetFullPath(
            Path.Combine(_rootPath, relativePath));
        var rootPrefix = _rootPath.EndsWith(
            Path.DirectorySeparatorChar)
            ? _rootPath
            : $"{_rootPath}{Path.DirectorySeparatorChar}";

        if (!path.StartsWith(
                rootPrefix,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "A chave do anexo está fora do armazenamento configurado.");
        }

        return path;
    }
}

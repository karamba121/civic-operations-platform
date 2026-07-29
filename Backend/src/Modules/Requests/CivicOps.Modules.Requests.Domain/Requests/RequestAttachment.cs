using CivicOps.BuildingBlocks.Domain;

namespace CivicOps.Modules.Requests.Domain.Requests;

public sealed class RequestAttachment
{
    public const int FileNameMaxLength = 255;
    public const int ContentTypeMaxLength = 255;
    public const int StorageKeyMaxLength = 1_024;
    public const int Sha256Length = 64;

    private RequestAttachment(
        Guid id,
        Guid tenantId,
        Guid requestId,
        Guid uploadedByUserId,
        string fileName,
        string contentType,
        long sizeBytes,
        string storageKey,
        string sha256,
        DateTimeOffset createdAtUtc)
    {
        Id = id;
        TenantId = tenantId;
        RequestId = requestId;
        UploadedByUserId = uploadedByUserId;
        FileName = fileName;
        ContentType = contentType;
        SizeBytes = sizeBytes;
        StorageKey = storageKey;
        Sha256 = sha256;
        CreatedAtUtc = createdAtUtc;
    }

    private RequestAttachment()
    {
        FileName = null!;
        ContentType = null!;
        StorageKey = null!;
        Sha256 = null!;
    }

    public Guid Id { get; private init; }

    public Guid TenantId { get; private init; }

    public Guid RequestId { get; private init; }

    public Guid UploadedByUserId { get; private init; }

    public string FileName { get; private init; }

    public string ContentType { get; private init; }

    public long SizeBytes { get; private init; }

    public string StorageKey { get; private init; }

    public string Sha256 { get; private init; }

    public DateTimeOffset CreatedAtUtc { get; private init; }

    public static RequestAttachment Create(
        Guid id,
        Guid tenantId,
        Guid requestId,
        Guid uploadedByUserId,
        string fileName,
        string contentType,
        long sizeBytes,
        string storageKey,
        string sha256,
        DateTimeOffset createdAtUtc)
    {
        EnsureIdentifier(id, "O anexo é obrigatório.");
        EnsureIdentifier(tenantId, "O tenant é obrigatório.");
        EnsureIdentifier(requestId, "A solicitação é obrigatória.");
        EnsureIdentifier(
            uploadedByUserId,
            "O usuário que enviou o anexo é obrigatório.");
        fileName = RequiredText(
            fileName,
            "O nome do arquivo é obrigatório.",
            FileNameMaxLength);
        contentType = RequiredText(
            contentType,
            "O tipo do arquivo é obrigatório.",
            ContentTypeMaxLength);
        storageKey = RequiredText(
            storageKey,
            "A chave de armazenamento é obrigatória.",
            StorageKeyMaxLength);

        if (sizeBytes <= 0)
        {
            throw new DomainException(
                "O conteúdo do anexo não pode estar vazio.");
        }

        if (sha256.Length != Sha256Length ||
            !sha256.All(Uri.IsHexDigit))
        {
            throw new DomainException(
                "O hash SHA-256 do anexo é inválido.");
        }

        if (createdAtUtc.Offset != TimeSpan.Zero)
        {
            throw new DomainException(
                "A data do anexo deve estar em UTC.");
        }

        return new RequestAttachment(
            id,
            tenantId,
            requestId,
            uploadedByUserId,
            fileName,
            contentType,
            sizeBytes,
            storageKey,
            sha256.ToLowerInvariant(),
            createdAtUtc);
    }

    private static void EnsureIdentifier(
        Guid value,
        string message)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException(message);
        }
    }

    private static string RequiredText(
        string value,
        string requiredMessage,
        int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException(requiredMessage);
        }

        value = value.Trim();

        if (value.Length > maximumLength)
        {
            throw new DomainException(
                $"O valor deve ter no máximo {maximumLength} caracteres.");
        }

        return value;
    }
}

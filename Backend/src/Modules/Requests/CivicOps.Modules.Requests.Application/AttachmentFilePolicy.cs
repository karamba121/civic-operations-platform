namespace CivicOps.Modules.Requests.Application;

public enum SupportedAttachmentType
{
    Pdf,
    Png,
    Jpeg
}

public readonly record struct ValidatedAttachmentType(
    SupportedAttachmentType Type,
    string ContentType);

public static class AttachmentFilePolicy
{
    public static ValidatedAttachmentType ValidateDeclaredType(
        string fileName,
        string declaredContentType)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = declaredContentType.Trim().ToLowerInvariant();

        return (extension, contentType) switch
        {
            (".pdf", "application/pdf") =>
                new(SupportedAttachmentType.Pdf, "application/pdf"),
            (".png", "image/png") =>
                new(SupportedAttachmentType.Png, "image/png"),
            (".jpg" or ".jpeg", "image/jpeg") =>
                new(SupportedAttachmentType.Jpeg, "image/jpeg"),
            _ => throw new AttachmentContentTypeNotAllowedException(
                "São permitidos apenas arquivos PDF, PNG e JPEG, com extensão e Content-Type correspondentes.")
        };
    }

    public static bool HasValidSignature(
        SupportedAttachmentType type,
        ReadOnlySpan<byte> contentPrefix)
    {
        return type switch
        {
            SupportedAttachmentType.Pdf =>
                contentPrefix.StartsWith("%PDF-"u8),
            SupportedAttachmentType.Png =>
                contentPrefix.StartsWith(
                    new byte[]
                    {
                        0x89, 0x50, 0x4E, 0x47,
                        0x0D, 0x0A, 0x1A, 0x0A
                    }),
            SupportedAttachmentType.Jpeg =>
                contentPrefix.StartsWith(
                    new byte[] { 0xFF, 0xD8, 0xFF }),
            _ => false
        };
    }
}

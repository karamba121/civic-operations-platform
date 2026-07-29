namespace CivicOps.Modules.Requests.Application;

public sealed class AttachmentContentTooLargeException(
    long maximumSizeBytes) : Exception(
        $"O anexo deve ter no máximo {maximumSizeBytes} bytes.")
{
    public long MaximumSizeBytes { get; } = maximumSizeBytes;
}

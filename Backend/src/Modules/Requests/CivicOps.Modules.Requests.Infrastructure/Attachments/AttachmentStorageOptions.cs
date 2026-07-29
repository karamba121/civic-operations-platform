namespace CivicOps.Modules.Requests.Infrastructure.Attachments;

internal sealed class AttachmentStorageOptions
{
    public string RootPath { get; set; } = "../../.data/attachments";

    public long MaximumSizeBytes { get; set; } = 25 * 1024 * 1024;
}

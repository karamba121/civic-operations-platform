namespace CivicOps.Modules.Requests.Application;

public sealed class AttachmentContentUnavailableException(
    Guid attachmentId) : Exception(
        $"O conteúdo do anexo {attachmentId} não está disponível.");

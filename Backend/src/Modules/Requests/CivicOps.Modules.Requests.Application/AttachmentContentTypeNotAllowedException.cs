namespace CivicOps.Modules.Requests.Application;

public sealed class AttachmentContentTypeNotAllowedException(string detail)
    : Exception(detail);

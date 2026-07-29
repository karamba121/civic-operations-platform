namespace CivicOps.Modules.Requests.Application.ListRequestAttachments;

public sealed record ListRequestAttachmentsQuery(
    Guid TenantId,
    Guid RequestId);

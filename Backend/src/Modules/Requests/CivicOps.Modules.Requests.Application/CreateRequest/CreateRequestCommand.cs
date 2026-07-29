namespace CivicOps.Modules.Requests.Application.CreateRequest;

public sealed record CreateRequestCommand(
    Guid TenantId,
    string IdempotencyKey,
    string Title,
    string Description);

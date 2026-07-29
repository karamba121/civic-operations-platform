namespace CivicOps.Modules.Requests.Application.CreateRequest;

public sealed record CreateRequestCommand(
    Guid TenantId,
    Guid ActorUserId,
    string IdempotencyKey,
    string Title,
    string Description);

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestIdempotencyRecord
{
    public Guid TenantId { get; private set; }

    public string Key { get; private set; } = null!;

    public string RequestHash { get; private set; } = null!;

    public Guid? RequestId { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }
}

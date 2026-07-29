namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestAuditRecord
{
    private RequestAuditRecord()
    {
        Action = null!;
        Data = null!;
    }

    private RequestAuditRecord(
        Guid id,
        Guid eventId,
        Guid tenantId,
        Guid requestId,
        Guid actorUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        Id = id;
        EventId = eventId;
        TenantId = tenantId;
        RequestId = requestId;
        ActorUserId = actorUserId;
        Action = action;
        Data = data;
        OccurredAtUtc = occurredAtUtc;
    }

    public Guid Id { get; private init; }

    public Guid EventId { get; private init; }

    public Guid TenantId { get; private init; }

    public Guid RequestId { get; private init; }

    public Guid ActorUserId { get; private init; }

    public string Action { get; private init; }

    public string Data { get; private init; }

    public DateTimeOffset OccurredAtUtc { get; private init; }

    public static RequestAuditRecord Create(
        Guid eventId,
        Guid tenantId,
        Guid requestId,
        Guid actorUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc)
    {
        return new RequestAuditRecord(
            Guid.CreateVersion7(),
            eventId,
            tenantId,
            requestId,
            actorUserId,
            action,
            data,
            occurredAtUtc);
    }
}

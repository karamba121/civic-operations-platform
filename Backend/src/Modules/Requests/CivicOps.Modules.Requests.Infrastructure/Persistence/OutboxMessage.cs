namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class OutboxMessage
{
    private OutboxMessage()
    {
        Type = null!;
        Payload = null!;
    }

    private OutboxMessage(
        Guid id,
        Guid tenantId,
        string type,
        string payload,
        DateTimeOffset occurredAtUtc,
        string? traceParent,
        string? traceState,
        string? baggage)
    {
        Id = id;
        TenantId = tenantId;
        Type = type;
        Payload = payload;
        OccurredAtUtc = occurredAtUtc;
        NextAttemptAtUtc = occurredAtUtc;
        TraceParent = traceParent;
        TraceState = traceState;
        Baggage = baggage;
    }

    public Guid Id { get; private init; }

    public Guid TenantId { get; private init; }

    public string Type { get; private init; }

    public string Payload { get; private init; }

    public DateTimeOffset OccurredAtUtc { get; private init; }

    public string? TraceParent { get; private init; }

    public string? TraceState { get; private init; }

    public string? Baggage { get; private init; }

    public DateTimeOffset NextAttemptAtUtc { get; private init; }

    public DateTimeOffset? ProcessedAtUtc { get; private set; }

    public int AttemptCount { get; private set; }

    public string? LastError { get; private set; }

    public Guid? LockId { get; private set; }

    public DateTimeOffset? LockedUntilUtc { get; private set; }

    public static OutboxMessage Create(
        Guid eventId,
        Guid tenantId,
        string type,
        string payload,
        DateTimeOffset occurredAtUtc,
        string? traceParent,
        string? traceState,
        string? baggage)
    {
        return new OutboxMessage(
            eventId,
            tenantId,
            type,
            payload,
            occurredAtUtc,
            traceParent,
            traceState,
            baggage);
    }
}

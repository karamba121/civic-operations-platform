namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed record ClaimedOutboxMessage(
    Guid Id,
    Guid TenantId,
    string Type,
    string Payload,
    DateTimeOffset OccurredAtUtc,
    string? TraceParent,
    string? TraceState,
    string? Baggage);

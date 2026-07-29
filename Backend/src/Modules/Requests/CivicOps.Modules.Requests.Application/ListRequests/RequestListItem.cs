namespace CivicOps.Modules.Requests.Application.ListRequests;

public sealed record RequestListItem(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Status,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

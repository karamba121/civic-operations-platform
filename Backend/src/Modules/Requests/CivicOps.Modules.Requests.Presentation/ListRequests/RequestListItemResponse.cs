namespace CivicOps.Modules.Requests.Presentation.ListRequests;

public sealed record RequestListItemResponse(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Status,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

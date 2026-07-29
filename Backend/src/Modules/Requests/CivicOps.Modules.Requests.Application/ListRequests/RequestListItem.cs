namespace CivicOps.Modules.Requests.Application.ListRequests;

public sealed record RequestListItem(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Status,
    Guid? ResponsibleUserId,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

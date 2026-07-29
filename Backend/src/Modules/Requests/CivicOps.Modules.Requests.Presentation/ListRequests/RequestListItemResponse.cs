namespace CivicOps.Modules.Requests.Presentation.ListRequests;

public sealed record RequestListItemResponse(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Status,
    Guid? ResponsibleUserId,
    DateTimeOffset? DueDateUtc,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

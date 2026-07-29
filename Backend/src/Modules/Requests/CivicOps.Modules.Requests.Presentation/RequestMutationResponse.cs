namespace CivicOps.Modules.Requests.Presentation;

public sealed record RequestMutationResponse(
    Guid Id,
    string ProtocolNumber,
    string Status,
    Guid? ResponsibleUserId,
    DateTimeOffset? DueDateUtc,
    Guid Version);

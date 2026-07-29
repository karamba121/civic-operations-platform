namespace CivicOps.Modules.Requests.Application;

public sealed record RequestMutationResult(
    Guid Id,
    string ProtocolNumber,
    string Status,
    Guid? ResponsibleUserId,
    DateTimeOffset? DueDateUtc,
    Guid Version);

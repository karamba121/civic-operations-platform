namespace CivicOps.Modules.Requests.Presentation.SetRequestDueDate;

public sealed record SetRequestDueDateRequest(
    DateTimeOffset? DueDateUtc,
    Guid Version);

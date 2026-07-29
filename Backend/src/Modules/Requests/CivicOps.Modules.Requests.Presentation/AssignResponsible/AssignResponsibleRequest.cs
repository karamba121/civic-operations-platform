namespace CivicOps.Modules.Requests.Presentation.AssignResponsible;

public sealed record AssignResponsibleRequest(
    Guid ResponsibleUserId,
    Guid Version);

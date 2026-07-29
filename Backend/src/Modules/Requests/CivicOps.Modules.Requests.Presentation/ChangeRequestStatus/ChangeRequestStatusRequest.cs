namespace CivicOps.Modules.Requests.Presentation.ChangeRequestStatus;

public sealed record ChangeRequestStatusRequest(string Status, Guid Version);

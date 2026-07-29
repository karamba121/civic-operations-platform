namespace CivicOps.Modules.Requests.Presentation.GetRequestDetails;

public sealed record RequestDetailsResponse(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Description,
    string Status,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

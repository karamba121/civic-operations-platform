namespace CivicOps.Modules.Requests.Application.GetRequestDetails;

public sealed record RequestDetailsResult(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Description,
    string Status,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

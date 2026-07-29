namespace CivicOps.Modules.Requests.Presentation.CreateRequest;

public sealed record CreateRequestResponse(
    Guid Id,
    string ProtocolNumber,
    string Status,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

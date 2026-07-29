namespace CivicOps.Modules.Requests.Application.CreateRequest;

public sealed record CreateRequestResult(
    Guid Id,
    string ProtocolNumber,
    string Status,
    DateTimeOffset CreatedAtUtc,
    Guid Version);

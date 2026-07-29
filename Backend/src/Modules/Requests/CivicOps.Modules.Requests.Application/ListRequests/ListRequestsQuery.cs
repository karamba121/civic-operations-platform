using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application.ListRequests;

public sealed record ListRequestsQuery(
    Guid TenantId,
    int Page,
    int PageSize,
    string? Search,
    RequestStatus? Status,
    DateTimeOffset? CreatedFromUtc,
    DateTimeOffset? CreatedToUtc);

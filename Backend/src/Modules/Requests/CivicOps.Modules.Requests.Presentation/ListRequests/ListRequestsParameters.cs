namespace CivicOps.Modules.Requests.Presentation.ListRequests;

public sealed class ListRequestsParameters
{
    public int? Page { get; init; }

    public int? PageSize { get; init; }

    public string? Search { get; init; }

    public string? Status { get; init; }

    public DateTimeOffset? CreatedFromUtc { get; init; }

    public DateTimeOffset? CreatedToUtc { get; init; }
}

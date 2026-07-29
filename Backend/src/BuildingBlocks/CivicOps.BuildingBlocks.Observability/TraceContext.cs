namespace CivicOps.BuildingBlocks.Observability;

public sealed record TraceContext(
    string? TraceParent,
    string? TraceState,
    string? Baggage)
{
    public static TraceContext Empty { get; } =
        new(null, null, null);

    public bool IsEmpty =>
        string.IsNullOrWhiteSpace(TraceParent);
}

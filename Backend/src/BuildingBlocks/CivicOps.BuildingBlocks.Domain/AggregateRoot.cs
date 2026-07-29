namespace CivicOps.BuildingBlocks.Domain;

public abstract class AggregateRoot<TId>
    where TId : notnull
{
    protected AggregateRoot(TId id)
    {
        Id = id;
    }

    public TId Id { get; protected init; }
}

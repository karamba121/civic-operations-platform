namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class ProtocolSequence
{
    public Guid TenantId { get; private set; }

    public int Year { get; private set; }

    public long LastValue { get; private set; }
}

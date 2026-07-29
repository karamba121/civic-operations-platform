namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestIdempotencyStore
{
    Task<IdempotencyReservation> ReserveAsync(
        Guid tenantId,
        string key,
        string requestHash,
        DateTimeOffset createdAtUtc,
        CancellationToken cancellationToken);

    Task CompleteAsync(
        Guid tenantId,
        string key,
        Guid requestId,
        CancellationToken cancellationToken);
}

public sealed record IdempotencyReservation(bool IsNew, Guid? ExistingRequestId);

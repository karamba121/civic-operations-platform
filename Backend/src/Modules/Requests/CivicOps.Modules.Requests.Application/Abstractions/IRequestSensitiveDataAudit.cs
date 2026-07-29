namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestSensitiveDataAudit
{
    Task RecordAsync(
        Guid tenantId,
        Guid requestId,
        Guid actorUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc,
        CancellationToken cancellationToken);
}

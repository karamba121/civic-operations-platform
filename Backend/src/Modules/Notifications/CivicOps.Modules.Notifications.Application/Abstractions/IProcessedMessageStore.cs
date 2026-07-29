namespace CivicOps.Modules.Notifications.Application.Abstractions;

public interface IProcessedMessageStore
{
    Task<bool> TryReserveAsync(
        Guid messageId,
        string messageType,
        DateTimeOffset processedAtUtc,
        CancellationToken cancellationToken);
}

namespace CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;

public interface IRequestAssignedNotificationProcessor
{
    Task<ProcessNotificationResult> ProcessAsync(
        ProcessRequestAssignedCommand command,
        CancellationToken cancellationToken);
}

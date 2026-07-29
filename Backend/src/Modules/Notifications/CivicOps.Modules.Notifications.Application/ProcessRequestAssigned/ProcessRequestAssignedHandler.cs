using CivicOps.Modules.Notifications.Application.Abstractions;
using CivicOps.Modules.Notifications.Domain.Notifications;

namespace CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;

public sealed class ProcessRequestAssignedHandler(
    IProcessedMessageStore processedMessageStore,
    INotificationRepository notificationRepository,
    INotificationsUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public Task<ProcessNotificationResult> HandleAsync(
        ProcessRequestAssignedCommand command,
        CancellationToken cancellationToken)
    {
        return unitOfWork.ExecuteInTransactionAsync(
            async transactionCancellationToken =>
            {
                var nowUtc = timeProvider.GetUtcNow();
                var reserved = await processedMessageStore.TryReserveAsync(
                    command.MessageId,
                    "requests.responsible-assigned.v1",
                    nowUtc,
                    transactionCancellationToken);

                if (!reserved)
                {
                    return new ProcessNotificationResult(false, null);
                }

                var notification = Notification.CreateRequestAssigned(
                    command.MessageId,
                    command.TenantId,
                    command.ResponsibleUserId,
                    command.RequestId,
                    command.ProtocolNumber,
                    nowUtc);
                notificationRepository.Add(notification);

                return new ProcessNotificationResult(true, notification.Id);
            },
            cancellationToken);
    }
}

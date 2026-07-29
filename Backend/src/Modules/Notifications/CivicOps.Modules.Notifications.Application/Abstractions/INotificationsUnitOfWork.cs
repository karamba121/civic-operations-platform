namespace CivicOps.Modules.Notifications.Application.Abstractions;

public interface INotificationsUnitOfWork
{
    Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken);
}

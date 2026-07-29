namespace CivicOps.Modules.Requests.Application.Abstractions;

public interface IRequestsUnitOfWork
{
    Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken);
}

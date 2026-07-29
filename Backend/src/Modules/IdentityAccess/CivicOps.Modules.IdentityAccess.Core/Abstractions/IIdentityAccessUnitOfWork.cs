namespace CivicOps.Modules.IdentityAccess;

public interface IIdentityAccessUnitOfWork
{
    Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken);
}

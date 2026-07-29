using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;

internal sealed class IdentityAccessUnitOfWork(
    IdentityAccessDbContext dbContext) : IIdentityAccessUnitOfWork
{
    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken)
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(
            async () =>
            {
                await using var transaction =
                    await dbContext.Database.BeginTransactionAsync(
                        cancellationToken);
                var result = await action(cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return result;
            });
    }
}

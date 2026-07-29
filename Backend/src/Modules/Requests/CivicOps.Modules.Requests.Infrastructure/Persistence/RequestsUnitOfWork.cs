using CivicOps.Modules.Requests.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestsUnitOfWork(RequestsDbContext dbContext) : IRequestsUnitOfWork
{
    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken)
    {
        var executionStrategy = dbContext.Database.CreateExecutionStrategy();

        return await executionStrategy.ExecuteAsync(async () =>
        {
            await using var transaction =
                await dbContext.Database.BeginTransactionAsync(cancellationToken);

            var result = await action(cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return result;
        });
    }
}

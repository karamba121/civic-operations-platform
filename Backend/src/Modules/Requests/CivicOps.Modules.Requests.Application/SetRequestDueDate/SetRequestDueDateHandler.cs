using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.SetRequestDueDate;

public sealed class SetRequestDueDateHandler(
    IRequestRepository repository,
    IRequestsUnitOfWork unitOfWork,
    IRequestDashboardCache dashboardCache,
    TimeProvider timeProvider)
{
    public async Task<RequestMutationResult?> HandleAsync(
        SetRequestDueDateCommand command,
        CancellationToken cancellationToken)
    {
        var result = await unitOfWork.ExecuteInTransactionAsync(
            async transactionCancellationToken =>
            {
                var request = await repository.GetAsync(
                    command.TenantId,
                    command.RequestId,
                    transactionCancellationToken);

                if (request is null)
                {
                    return null;
                }

                request.SetDueDate(
                    command.DueDateUtc,
                    command.ExpectedVersion,
                    timeProvider.GetUtcNow(),
                    command.ActorUserId);

                return new RequestMutationResult(
                    request.Id,
                    request.ProtocolNumber.Value,
                    request.Status.ToString(),
                    request.ResponsibleUserId,
                    request.DueDateUtc,
                    request.Version);
            },
            cancellationToken);
        if (result is not null)
        {
            await dashboardCache.InvalidateAsync(
                command.TenantId,
                CancellationToken.None);
        }

        return result;
    }
}

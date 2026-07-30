using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.AssignResponsible;

public sealed class AssignResponsibleHandler(
    IRequestRepository repository,
    IRequestsUnitOfWork unitOfWork,
    IRequestDashboardCache dashboardCache,
    TimeProvider timeProvider)
{
    public async Task<RequestMutationResult?> HandleAsync(
        AssignResponsibleCommand command,
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

                request.AssignResponsible(
                    command.ResponsibleUserId,
                    command.ExpectedVersion,
                    command.ActorUserId,
                    timeProvider.GetUtcNow());

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

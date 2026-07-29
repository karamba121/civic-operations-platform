using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.ChangeRequestStatus;

public sealed class ChangeRequestStatusHandler(
    IRequestRepository repository,
    IRequestsUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public Task<RequestMutationResult?> HandleAsync(
        ChangeRequestStatusCommand command,
        CancellationToken cancellationToken)
    {
        return unitOfWork.ExecuteInTransactionAsync(
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

                request.ChangeStatus(
                    command.Status,
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
    }
}

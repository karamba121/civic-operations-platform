using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.AssignResponsible;

public sealed class AssignResponsibleHandler(
    IRequestRepository repository,
    IRequestsUnitOfWork unitOfWork)
{
    public Task<RequestMutationResult?> HandleAsync(
        AssignResponsibleCommand command,
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

                request.AssignResponsible(
                    command.ResponsibleUserId,
                    command.ExpectedVersion);

                return new RequestMutationResult(
                    request.Id,
                    request.ProtocolNumber.Value,
                    request.Status.ToString(),
                    request.ResponsibleUserId,
                    request.Version);
            },
            cancellationToken);
    }
}

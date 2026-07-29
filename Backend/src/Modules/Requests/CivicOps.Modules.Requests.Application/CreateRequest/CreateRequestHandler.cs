using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;
using System.Security.Cryptography;
using System.Text;

namespace CivicOps.Modules.Requests.Application.CreateRequest;

public sealed class CreateRequestHandler(
    IRequestRepository repository,
    IProtocolNumberGenerator protocolNumberGenerator,
    IRequestIdempotencyStore idempotencyStore,
    IRequestsUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public Task<CreateRequestResult> HandleAsync(
        CreateRequestCommand command,
        CancellationToken cancellationToken)
    {
        return unitOfWork.ExecuteInTransactionAsync(
            async transactionCancellationToken =>
            {
                var now = timeProvider.GetUtcNow();
                var requestHash = ComputeRequestHash(command.Title, command.Description);
                var reservation = await idempotencyStore.ReserveAsync(
                    command.TenantId,
                    command.IdempotencyKey,
                    requestHash,
                    now,
                    transactionCancellationToken);

                if (!reservation.IsNew)
                {
                    var existingRequest = await repository.GetAsync(
                        command.TenantId,
                        reservation.ExistingRequestId!.Value,
                        transactionCancellationToken)
                        ?? throw new InvalidOperationException(
                            "A solicitação idempotente não foi encontrada.");

                    return ToResult(existingRequest);
                }

                var protocolNumber = await protocolNumberGenerator.NextAsync(
                    command.TenantId,
                    now.Year,
                    transactionCancellationToken);

                var request = Request.Create(
                    command.TenantId,
                    command.ActorUserId,
                    protocolNumber,
                    command.Title,
                    command.Description,
                    now);

                repository.Add(request);
                await idempotencyStore.CompleteAsync(
                    command.TenantId,
                    command.IdempotencyKey,
                    request.Id,
                    transactionCancellationToken);

                return ToResult(request);
            },
            cancellationToken);
    }

    private static CreateRequestResult ToResult(Request request)
    {
        return new CreateRequestResult(
            request.Id,
            request.ProtocolNumber.Value,
            request.Status.ToString(),
            request.CreatedAtUtc,
            request.Version);
    }

    private static string ComputeRequestHash(string title, string description)
    {
        var canonicalPayload =
            $"{title.Length}:{title}{description.Length}:{description}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(canonicalPayload));
        return Convert.ToHexString(hash);
    }
}

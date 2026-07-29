using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application.AddRequestComment;

public sealed class AddRequestCommentHandler(
    IRequestRepository requestRepository,
    IRequestCommentRepository commentRepository,
    IRequestsUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public Task<AddRequestCommentResult?> HandleAsync(
        AddRequestCommentCommand command,
        CancellationToken cancellationToken)
    {
        return unitOfWork.ExecuteInTransactionAsync(
            async transactionCancellationToken =>
            {
                var request = await requestRepository.GetAsync(
                    command.TenantId,
                    command.RequestId,
                    transactionCancellationToken);

                if (request is null)
                {
                    return null;
                }

                var comment = RequestComment.Create(
                    command.TenantId,
                    request.Id,
                    command.AuthorUserId,
                    command.Content,
                    timeProvider.GetUtcNow());

                commentRepository.Add(comment);
                request.RegisterComment(
                    comment.Id,
                    command.AuthorUserId,
                    comment.CreatedAtUtc);

                return new AddRequestCommentResult(
                    comment.Id,
                    comment.RequestId,
                    comment.AuthorUserId,
                    comment.Content,
                    comment.CreatedAtUtc);
            },
            cancellationToken);
    }
}

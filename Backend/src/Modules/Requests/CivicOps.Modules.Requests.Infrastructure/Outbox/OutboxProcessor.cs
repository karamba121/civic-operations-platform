using Microsoft.Extensions.Logging;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxProcessor(
    IOutboxMessageStore store,
    IIntegrationEventPublisher publisher,
    OutboxPublisherOptions options,
    TimeProvider timeProvider,
    ILogger<OutboxProcessor> logger)
{
    public async Task<int> ProcessBatchAsync(CancellationToken cancellationToken)
    {
        var nowUtc = timeProvider.GetUtcNow();
        var lockId = Guid.NewGuid();
        var messages = await store.ClaimPendingAsync(
            lockId,
            nowUtc,
            options.BatchSize,
            options.LockDuration,
            cancellationToken);

        foreach (var message in messages)
        {
            try
            {
                await publisher.PublishAsync(message, cancellationToken);
                var marked = await store.MarkProcessedAsync(
                    message.Id,
                    lockId,
                    timeProvider.GetUtcNow(),
                    cancellationToken);

                if (!marked)
                {
                    logger.LogWarning(
                        "O lease da mensagem Outbox {MessageId} expirou após a publicação.",
                        message.Id);
                }
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception exception)
            {
                var error = exception.ToString();

                if (error.Length > 4_000)
                {
                    error = error[..4_000];
                }

                await store.MarkFailedAsync(
                    message.Id,
                    lockId,
                    error,
                    timeProvider.GetUtcNow().Add(options.FailureDelay),
                    cancellationToken);
                logger.LogError(
                    exception,
                    "Falha ao publicar a mensagem Outbox {MessageId}.",
                    message.Id);
            }
        }

        return messages.Count;
    }
}

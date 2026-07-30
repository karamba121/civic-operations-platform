using Microsoft.Extensions.Logging;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxRetentionProcessor(
    IOutboxMessageStore store,
    OutboxRetentionOptions options,
    TimeProvider timeProvider,
    OutboxDiagnostics diagnostics,
    ILogger<OutboxRetentionProcessor> logger)
{
    public async Task<int> ProcessCycleAsync(
        CancellationToken cancellationToken)
    {
        var operationId = Guid.NewGuid();
        var startedAtUtc = timeProvider.GetUtcNow();
        var cutoffUtc = startedAtUtc.Subtract(options.RetentionPeriod);
        var removedMessages = 0;

        try
        {
            for (var batch = 0;
                 batch < options.MaxBatchesPerCycle;
                 batch++)
            {
                var removedInBatch =
                    await store.DeleteProcessedBatchAsync(
                        cutoffUtc,
                        options.BatchSize,
                        cancellationToken);

                removedMessages += removedInBatch;

                if (removedInBatch < options.BatchSize)
                {
                    break;
                }

                await Task.Delay(
                    options.BatchDelay,
                    timeProvider,
                    cancellationToken);
            }

            logger.LogInformation(
                "Ciclo de retenção da Outbox concluído. " +
                "OperationId: {OperationId}; CutoffUtc: {CutoffUtc}; " +
                "RemovedMessages: {RemovedMessages}.",
                operationId,
                cutoffUtc,
                removedMessages);

            return removedMessages;
        }
        catch (OperationCanceledException)
            when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            diagnostics.RecordRetentionFailure();
            logger.LogError(
                exception,
                "Falha no ciclo de retenção da Outbox. " +
                "OperationId: {OperationId}; CutoffUtc: {CutoffUtc}; " +
                "RemovedMessagesBeforeFailure: {RemovedMessages}.",
                operationId,
                cutoffUtc,
                removedMessages);

            return removedMessages;
        }
        finally
        {
            diagnostics.RecordRetentionRemoved(removedMessages);
        }
    }
}

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxMetricsCollector(
    IServiceScopeFactory scopeFactory,
    OutboxDiagnostics diagnostics,
    OutboxMetricsOptions options,
    TimeProvider timeProvider,
    ILogger<OutboxMetricsCollector> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.Enabled)
        {
            logger.LogInformation("A coleta de métricas da Outbox está desabilitada.");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            await CollectOnceAsync(stoppingToken);

            try
            {
                await Task.Delay(options.CollectionInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    internal async Task CollectOnceAsync(CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var store = scope.ServiceProvider
                .GetRequiredService<IOutboxMessageStore>();
            var snapshot = await store.GetMetricsAsync(
                timeProvider.GetUtcNow(),
                cancellationToken);

            diagnostics.UpdateSnapshot(snapshot);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            diagnostics.RecordCollectionFailure();
            logger.LogWarning(
                exception,
                "Falha ao coletar métricas operacionais da Outbox.");
        }
    }
}

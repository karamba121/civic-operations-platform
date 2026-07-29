using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxPublisherWorker(
    IServiceScopeFactory scopeFactory,
    OutboxPublisherOptions options,
    ILogger<OutboxPublisherWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.Enabled)
        {
            logger.LogInformation("O publicador da Outbox está desabilitado.");
            return;
        }

        logger.LogInformation("O publicador da Outbox foi iniciado.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var processor = scope.ServiceProvider
                    .GetRequiredService<OutboxProcessor>();
                var processed = await processor.ProcessBatchAsync(stoppingToken);

                if (processed == 0)
                {
                    await Task.Delay(options.PollingInterval, stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(
                    exception,
                    "Falha inesperada no processamento da Outbox.");
                await Task.Delay(options.PollingInterval, stoppingToken);
            }
        }
    }
}

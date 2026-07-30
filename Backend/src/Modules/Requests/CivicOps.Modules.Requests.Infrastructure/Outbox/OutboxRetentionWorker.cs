using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class OutboxRetentionWorker(
    IServiceScopeFactory scopeFactory,
    OutboxRetentionOptions options,
    TimeProvider timeProvider,
    ILogger<OutboxRetentionWorker> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        if (!options.Enabled)
        {
            logger.LogInformation(
                "A retenção da Outbox está desabilitada.");
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            await using (var scope = scopeFactory.CreateAsyncScope())
            {
                var processor = scope.ServiceProvider
                    .GetRequiredService<OutboxRetentionProcessor>();

                await processor.ProcessCycleAsync(stoppingToken);
            }

            try
            {
                await Task.Delay(
                    options.ExecutionInterval,
                    timeProvider,
                    stoppingToken);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}

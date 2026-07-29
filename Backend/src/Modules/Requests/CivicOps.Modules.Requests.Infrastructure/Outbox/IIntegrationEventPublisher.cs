namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal interface IIntegrationEventPublisher
{
    Task PublishAsync(
        ClaimedOutboxMessage message,
        CancellationToken cancellationToken);
}

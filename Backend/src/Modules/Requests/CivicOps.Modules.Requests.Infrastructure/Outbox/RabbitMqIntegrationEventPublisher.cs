using RabbitMQ.Client;
using System.Text;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class RabbitMqIntegrationEventPublisher(
    RabbitMqOptions options) : IIntegrationEventPublisher, IAsyncDisposable
{
    private readonly SemaphoreSlim _channelLock = new(1, 1);
    private IConnection? _connection;
    private IChannel? _channel;

    public async Task PublishAsync(
        ClaimedOutboxMessage message,
        CancellationToken cancellationToken)
    {
        await _channelLock.WaitAsync(cancellationToken);

        try
        {
            var channel = await GetChannelAsync(cancellationToken);
            var properties = new BasicProperties
            {
                Persistent = true,
                ContentType = "application/json",
                ContentEncoding = "utf-8",
                MessageId = message.Id.ToString(),
                Type = message.Type,
                Timestamp = new AmqpTimestamp(
                    message.OccurredAtUtc.ToUnixTimeSeconds()),
                Headers = new Dictionary<string, object?>
                {
                    ["tenant-id"] = message.TenantId.ToString()
                }
            };

            await channel.BasicPublishAsync(
                options.ExchangeName,
                message.Type,
                mandatory: false,
                properties,
                Encoding.UTF8.GetBytes(message.Payload),
                cancellationToken);
        }
        catch
        {
            await ResetConnectionAsync();
            throw;
        }
        finally
        {
            _channelLock.Release();
        }
    }

    public async ValueTask DisposeAsync()
    {
        await _channelLock.WaitAsync();

        try
        {
            await ResetConnectionAsync();
        }
        finally
        {
            _channelLock.Release();
            _channelLock.Dispose();
        }
    }

    private async Task<IChannel> GetChannelAsync(
        CancellationToken cancellationToken)
    {
        if (_channel is { IsOpen: true })
        {
            return _channel;
        }

        await ResetConnectionAsync();

        var connectionFactory = new ConnectionFactory
        {
            HostName = options.HostName,
            Port = options.Port,
            UserName = options.UserName,
            Password = options.Password,
            VirtualHost = options.VirtualHost,
            AutomaticRecoveryEnabled = true,
            TopologyRecoveryEnabled = true
        };

        _connection = await connectionFactory.CreateConnectionAsync(
            "civic-operations-outbox-publisher",
            cancellationToken);
        _channel = await _connection.CreateChannelAsync(
            new CreateChannelOptions(
                publisherConfirmationsEnabled: true,
                publisherConfirmationTrackingEnabled: true),
            cancellationToken);
        await _channel.ExchangeDeclareAsync(
            options.ExchangeName,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        return _channel;
    }

    private async Task ResetConnectionAsync()
    {
        if (_channel is not null)
        {
            await _channel.DisposeAsync();
            _channel = null;
        }

        if (_connection is not null)
        {
            await _connection.DisposeAsync();
            _connection = null;
        }
    }
}

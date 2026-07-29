using CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text.Json;

namespace CivicOps.Modules.Notifications.Infrastructure.Messaging;

internal sealed class RequestAssignedNotificationsConsumer(
    IServiceScopeFactory scopeFactory,
    NotificationsConsumerOptions consumerOptions,
    RabbitMqOptions rabbitMqOptions,
    ILogger<RequestAssignedNotificationsConsumer> logger) : BackgroundService
{
    private const string MessageType = "requests.responsible-assigned.v1";
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private IConnection? _connection;
    private IChannel? _channel;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!consumerOptions.Enabled)
        {
            logger.LogInformation("O consumidor de notificações está desabilitado.");
            return;
        }

        var factory = new ConnectionFactory
        {
            HostName = rabbitMqOptions.HostName,
            Port = rabbitMqOptions.Port,
            UserName = rabbitMqOptions.UserName,
            Password = rabbitMqOptions.Password,
            VirtualHost = rabbitMqOptions.VirtualHost,
            AutomaticRecoveryEnabled = true,
            TopologyRecoveryEnabled = true
        };

        _connection = await factory.CreateConnectionAsync(
            "civic-operations-notifications-consumer",
            stoppingToken);
        _channel = await _connection.CreateChannelAsync(
            cancellationToken: stoppingToken);
        await _channel.ExchangeDeclareAsync(
            rabbitMqOptions.ExchangeName,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: stoppingToken);
        await _channel.QueueDeclareAsync(
            consumerOptions.QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: stoppingToken);
        await _channel.QueueBindAsync(
            consumerOptions.QueueName,
            rabbitMqOptions.ExchangeName,
            MessageType,
            arguments: null,
            cancellationToken: stoppingToken);
        await _channel.BasicQosAsync(
            prefetchSize: 0,
            consumerOptions.PrefetchCount,
            global: false,
            cancellationToken: stoppingToken);

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += HandleMessageAsync;
        await _channel.BasicConsumeAsync(
            consumerOptions.QueueName,
            autoAck: false,
            consumer,
            cancellationToken: stoppingToken);

        logger.LogInformation(
            "Consumidor de notificações iniciado na fila {QueueName}.",
            consumerOptions.QueueName);
        await Task.Delay(Timeout.InfiniteTimeSpan, stoppingToken);
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        await base.StopAsync(cancellationToken);

        if (_connection is not null)
        {
            await _connection.DisposeAsync();
            _connection = null;
        }

        _channel = null;
    }

    private async Task HandleMessageAsync(
        object sender,
        BasicDeliverEventArgs eventArgs)
    {
        var channel = (IChannel)((AsyncEventingBasicConsumer)sender).Channel;

        try
        {
            var messageId = ParseMessageId(eventArgs.BasicProperties.MessageId);
            var messageType = eventArgs.BasicProperties.Type;

            if (!string.Equals(messageType, MessageType, StringComparison.Ordinal))
            {
                throw new InvalidDataException(
                    $"Tipo de mensagem inesperado: {messageType}.");
            }

            var integrationEvent =
                JsonSerializer.Deserialize<RequestResponsibleAssignedIntegrationEvent>(
                    eventArgs.Body.Span,
                    SerializerOptions)
                ?? throw new InvalidDataException("O payload está vazio.");

            if (integrationEvent.EventId != messageId)
            {
                throw new InvalidDataException(
                    "O MessageId não corresponde ao EventId do payload.");
            }

            await using var scope = scopeFactory.CreateAsyncScope();
            var handler = scope.ServiceProvider
                .GetRequiredService<ProcessRequestAssignedHandler>();
            var result = await handler.HandleAsync(
                new ProcessRequestAssignedCommand(
                    messageId,
                    integrationEvent.TenantId,
                    integrationEvent.RequestId,
                    string.IsNullOrWhiteSpace(integrationEvent.ProtocolNumber)
                        ? integrationEvent.RequestId.ToString("N")
                        : integrationEvent.ProtocolNumber,
                    integrationEvent.ResponsibleUserId,
                    integrationEvent.OccurredAtUtc),
                eventArgs.CancellationToken);

            await channel.BasicAckAsync(
                eventArgs.DeliveryTag,
                multiple: false,
                eventArgs.CancellationToken);

            logger.LogInformation(
                result.WasProcessed
                    ? "Mensagem {MessageId} processada e confirmada."
                    : "Mensagem duplicada {MessageId} confirmada sem novo efeito.",
                messageId);
        }
        catch (Exception exception)
            when (exception is JsonException or InvalidDataException)
        {
            logger.LogError(
                exception,
                "Mensagem inválida rejeitada sem requeue.");
            await channel.BasicNackAsync(
                eventArgs.DeliveryTag,
                multiple: false,
                requeue: false,
                eventArgs.CancellationToken);
        }
        catch (OperationCanceledException)
            when (eventArgs.CancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Falha transitória ao processar a mensagem; será reenfileirada.");
            await channel.BasicNackAsync(
                eventArgs.DeliveryTag,
                multiple: false,
                requeue: true,
                eventArgs.CancellationToken);
        }
    }

    private static Guid ParseMessageId(string? messageId)
    {
        if (!Guid.TryParse(messageId, out var parsed) || parsed == Guid.Empty)
        {
            throw new InvalidDataException("O MessageId é inválido.");
        }

        return parsed;
    }
}

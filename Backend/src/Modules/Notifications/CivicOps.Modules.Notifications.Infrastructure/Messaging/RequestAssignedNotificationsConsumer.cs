using CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace CivicOps.Modules.Notifications.Infrastructure.Messaging;

internal sealed class RequestAssignedNotificationsConsumer(
    IServiceScopeFactory scopeFactory,
    NotificationsConsumerOptions consumerOptions,
    RabbitMqOptions rabbitMqOptions,
    TimeProvider timeProvider,
    ILogger<RequestAssignedNotificationsConsumer> logger) : BackgroundService
{
    private const string MessageType = "requests.responsible-assigned.v1";
    private const string RetryCountHeader = "x-civicops-retry-count";
    private const string OriginalQueueHeader = "x-civicops-original-queue";
    private const string LastErrorHeader = "x-civicops-last-error";
    private const string FailedAtHeader = "x-civicops-failed-at";
    private const string DeadLetterReasonHeader =
        "x-civicops-dead-letter-reason";

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private IConnection? _connection;
    private IChannel? _channel;

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        if (!consumerOptions.Enabled)
        {
            logger.LogInformation(
                "O consumidor de notificações está desabilitado.");
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
            new CreateChannelOptions(
                publisherConfirmationsEnabled: true,
                publisherConfirmationTrackingEnabled: true),
            cancellationToken: stoppingToken);

        await DeclareTopologyAsync(_channel, stoppingToken);
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
            "Consumidor de notificações iniciado na fila {QueueName} com " +
            "{RetryCount} retentativas e DLQ {DeadLetterQueueName}.",
            consumerOptions.QueueName,
            consumerOptions.RetryDelays.Length,
            consumerOptions.DeadLetterQueueName);

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

    private async Task DeclareTopologyAsync(
        IChannel channel,
        CancellationToken cancellationToken)
    {
        await channel.ExchangeDeclareAsync(
            rabbitMqOptions.ExchangeName,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);
        await channel.ExchangeDeclareAsync(
            consumerOptions.RetryExchangeName,
            ExchangeType.Direct,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);
        await channel.ExchangeDeclareAsync(
            consumerOptions.DeadLetterExchangeName,
            ExchangeType.Direct,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);

        await channel.QueueDeclareAsync(
            consumerOptions.QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);
        await channel.QueueBindAsync(
            consumerOptions.QueueName,
            rabbitMqOptions.ExchangeName,
            MessageType,
            arguments: null,
            cancellationToken: cancellationToken);

        for (var index = 0;
             index < consumerOptions.RetryDelays.Length;
             index++)
        {
            var attempt = index + 1;
            var arguments = new Dictionary<string, object?>
            {
                ["x-message-ttl"] = checked(
                    (int)consumerOptions.RetryDelays[index].TotalMilliseconds),
                ["x-dead-letter-exchange"] = string.Empty,
                ["x-dead-letter-routing-key"] = consumerOptions.QueueName
            };

            await channel.QueueDeclareAsync(
                GetRetryQueueName(attempt),
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments,
                cancellationToken: cancellationToken);
            await channel.QueueBindAsync(
                GetRetryQueueName(attempt),
                consumerOptions.RetryExchangeName,
                GetRetryRoutingKey(attempt),
                arguments: null,
                cancellationToken: cancellationToken);
        }

        await channel.QueueDeclareAsync(
            consumerOptions.DeadLetterQueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);
        await channel.QueueBindAsync(
            consumerOptions.DeadLetterQueueName,
            consumerOptions.DeadLetterExchangeName,
            GetDeadLetterRoutingKey(),
            arguments: null,
            cancellationToken: cancellationToken);
    }

    private async Task HandleMessageAsync(
        object sender,
        BasicDeliverEventArgs eventArgs)
    {
        var channel =
            (IChannel)((AsyncEventingBasicConsumer)sender).Channel;

        try
        {
            var messageId = ParseMessageId(
                eventArgs.BasicProperties.MessageId);
            var messageType = eventArgs.BasicProperties.Type;

            if (!string.Equals(
                    messageType,
                    MessageType,
                    StringComparison.Ordinal))
            {
                throw new InvalidDataException(
                    $"Tipo de mensagem inesperado: {messageType}.");
            }

            var integrationEvent =
                JsonSerializer
                    .Deserialize<RequestResponsibleAssignedIntegrationEvent>(
                        eventArgs.Body.Span,
                        SerializerOptions)
                ?? throw new InvalidDataException("O payload está vazio.");

            ValidateIntegrationEvent(integrationEvent, messageId);

            await using var scope = scopeFactory.CreateAsyncScope();
            var processor = scope.ServiceProvider
                .GetRequiredService<IRequestAssignedNotificationProcessor>();
            var result = await processor.ProcessAsync(
                new ProcessRequestAssignedCommand(
                    messageId,
                    integrationEvent.TenantId,
                    integrationEvent.RequestId,
                    string.IsNullOrWhiteSpace(
                        integrationEvent.ProtocolNumber)
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
            await MoveToDeadLetterOrRequeueAsync(
                channel,
                eventArgs,
                exception,
                "invalid-message");
        }
        catch (OperationCanceledException)
            when (eventArgs.CancellationToken.IsCancellationRequested)
        {
            return;
        }
        catch (Exception exception)
        {
            await RetryOrDeadLetterAsync(
                channel,
                eventArgs,
                exception);
        }
    }

    private async Task RetryOrDeadLetterAsync(
        IChannel channel,
        BasicDeliverEventArgs eventArgs,
        Exception processingException)
    {
        var retryCount = GetRetryCount(
            eventArgs.BasicProperties.Headers);

        if (retryCount >= consumerOptions.RetryDelays.Length)
        {
            await MoveToDeadLetterOrRequeueAsync(
                channel,
                eventArgs,
                processingException,
                "retries-exhausted");
            return;
        }

        var nextAttempt = retryCount + 1;

        try
        {
            var properties = CreateForwardProperties(
                eventArgs.BasicProperties,
                processingException,
                nextAttempt);

            await channel.BasicPublishAsync(
                consumerOptions.RetryExchangeName,
                GetRetryRoutingKey(nextAttempt),
                mandatory: true,
                properties,
                eventArgs.Body,
                eventArgs.CancellationToken);
            await channel.BasicAckAsync(
                eventArgs.DeliveryTag,
                multiple: false,
                eventArgs.CancellationToken);

            logger.LogWarning(
                processingException,
                "Mensagem {MessageId} enviada para retry {RetryAttempt} " +
                "com atraso de {RetryDelay}.",
                eventArgs.BasicProperties.MessageId,
                nextAttempt,
                consumerOptions.RetryDelays[nextAttempt - 1]);
        }
        catch (OperationCanceledException)
            when (eventArgs.CancellationToken.IsCancellationRequested)
        {
            return;
        }
        catch (Exception routingException)
        {
            await RequeueOriginalAsync(
                channel,
                eventArgs,
                routingException,
                "retry");
        }
    }

    private async Task MoveToDeadLetterOrRequeueAsync(
        IChannel channel,
        BasicDeliverEventArgs eventArgs,
        Exception processingException,
        string reason)
    {
        try
        {
            var retryCount = GetRetryCount(
                eventArgs.BasicProperties.Headers);
            var properties = CreateForwardProperties(
                eventArgs.BasicProperties,
                processingException,
                retryCount);
            properties.Headers![DeadLetterReasonHeader] = reason;

            await channel.BasicPublishAsync(
                consumerOptions.DeadLetterExchangeName,
                GetDeadLetterRoutingKey(),
                mandatory: true,
                properties,
                eventArgs.Body,
                eventArgs.CancellationToken);
            await channel.BasicAckAsync(
                eventArgs.DeliveryTag,
                multiple: false,
                eventArgs.CancellationToken);

            logger.LogError(
                processingException,
                "Mensagem {MessageId} movida para a DLQ " +
                "{DeadLetterQueueName}. Motivo: {DeadLetterReason}.",
                eventArgs.BasicProperties.MessageId,
                consumerOptions.DeadLetterQueueName,
                reason);
        }
        catch (OperationCanceledException)
            when (eventArgs.CancellationToken.IsCancellationRequested)
        {
            return;
        }
        catch (Exception routingException)
        {
            await RequeueOriginalAsync(
                channel,
                eventArgs,
                routingException,
                "DLQ");
        }
    }

    private async Task RequeueOriginalAsync(
        IChannel channel,
        BasicDeliverEventArgs eventArgs,
        Exception routingException,
        string destination)
    {
        logger.LogError(
            routingException,
            "Não foi possível confirmar o envio para {Destination} da " +
            "mensagem {MessageId}; a entrega original será reenfileirada.",
            destination,
            eventArgs.BasicProperties.MessageId);
        await channel.BasicNackAsync(
            eventArgs.DeliveryTag,
            multiple: false,
            requeue: true,
            eventArgs.CancellationToken);
    }

    private BasicProperties CreateForwardProperties(
        IReadOnlyBasicProperties source,
        Exception exception,
        int retryCount)
    {
        var properties = new BasicProperties(source)
        {
            Headers = source.Headers is null
                ? new Dictionary<string, object?>()
                : new Dictionary<string, object?>(source.Headers)
        };

        properties.Headers[RetryCountHeader] = retryCount;
        properties.Headers[OriginalQueueHeader] =
            consumerOptions.QueueName;
        properties.Headers[LastErrorHeader] =
            exception.GetType().Name;
        properties.Headers[FailedAtHeader] =
            timeProvider.GetUtcNow().ToString("O");

        return properties;
    }

    private static int GetRetryCount(
        IDictionary<string, object?>? headers)
    {
        if (headers is null ||
            !headers.TryGetValue(RetryCountHeader, out var value))
        {
            return 0;
        }

        return value switch
        {
            byte typed => typed,
            short typed => typed,
            int typed => typed,
            long typed when typed is >= 0 and <= int.MaxValue =>
                (int)typed,
            byte[] bytes when int.TryParse(
                Encoding.UTF8.GetString(bytes),
                out var parsed) => parsed,
            _ => 0
        };
    }

    private static void ValidateIntegrationEvent(
        RequestResponsibleAssignedIntegrationEvent integrationEvent,
        Guid messageId)
    {
        if (integrationEvent.EventId != messageId)
        {
            throw new InvalidDataException(
                "O MessageId não corresponde ao EventId do payload.");
        }

        if (integrationEvent.TenantId == Guid.Empty ||
            integrationEvent.RequestId == Guid.Empty ||
            integrationEvent.ResponsibleUserId == Guid.Empty)
        {
            throw new InvalidDataException(
                "O payload contém identificadores inválidos.");
        }
    }

    private string GetRetryQueueName(int attempt) =>
        $"{consumerOptions.QueueName}.retry.{attempt}";

    private string GetRetryRoutingKey(int attempt) =>
        $"{consumerOptions.QueueName}.retry.{attempt}";

    private string GetDeadLetterRoutingKey() =>
        $"{consumerOptions.QueueName}.dead-letter";

    private static Guid ParseMessageId(string? messageId)
    {
        if (!Guid.TryParse(messageId, out var parsed) ||
            parsed == Guid.Empty)
        {
            throw new InvalidDataException("O MessageId é inválido.");
        }

        return parsed;
    }
}

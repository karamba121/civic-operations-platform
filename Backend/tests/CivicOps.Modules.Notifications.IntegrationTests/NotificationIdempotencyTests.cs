using CivicOps.Modules.Notifications.Application.ProcessRequestAssigned;
using CivicOps.Modules.Notifications.Infrastructure.Persistence;
using CivicOps.Modules.Notifications.Presentation.ListNotifications;
using CivicOps.Modules.Requests.Infrastructure.Persistence;
using CivicOps.Modules.Requests.Presentation;
using CivicOps.Modules.Requests.Presentation.AssignResponsible;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System.Data;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;

namespace CivicOps.Modules.Notifications.IntegrationTests;

public sealed class NotificationIdempotencyTests
{
    [Fact]
    public async Task Assignment_ShouldCreateSingleNotificationForDuplicateMessage()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var suffix = Guid.NewGuid().ToString("N");
        var queueName = $"civicops.tests.notifications.{suffix}";
        var exchangeName = $"civicops.tests.events.{suffix}";
        var retryExchangeName = $"civicops.tests.retry.{suffix}";
        var deadLetterExchangeName = $"civicops.tests.dead-letter.{suffix}";
        var deadLetterQueueName = $"{queueName}.dead-letter";
        const int retryQueueCount = 3;
        var factory = CreateFactory(
            queueName,
            exchangeName,
            retryExchangeName,
            deadLetterExchangeName,
            deadLetterQueueName);

        try
        {
            using var client = factory.CreateClient();
            var tenantId = Guid.NewGuid();
            var actorUserId = Guid.NewGuid();
            var responsibleUserId = Guid.NewGuid();
            var created = await CreateRequestAsync(
                client,
                tenantId,
                actorUserId,
                cancellationToken);

            using var assignmentResponse = await AssignResponsibleAsync(
                client,
                tenantId,
                actorUserId,
                responsibleUserId,
                created,
                cancellationToken);

            Assert.Equal(HttpStatusCode.OK, assignmentResponse.StatusCode);

            var outboxMessage = await GetAssignmentOutboxMessageAsync(
                factory,
                tenantId,
                created.Id,
                cancellationToken);
            await PublishDuplicateAsync(
                outboxMessage,
                queueName,
                exchangeName,
                cancellationToken);

            var notification = await WaitForNotificationAsync(
                client,
                tenantId,
                responsibleUserId,
                created.Id,
                cancellationToken);

            Assert.NotNull(notification);
            Assert.Equal(created.ProtocolNumber, notification.ProtocolNumber);
            Assert.Equal("RequestAssigned", notification.Type);

            await WaitUntilQueueIsEmptyAsync(queueName, cancellationToken);

            using var listResponse = await ListNotificationsAsync(
                client,
                tenantId,
                responsibleUserId,
                cancellationToken);
            var notifications = await listResponse.Content
                .ReadFromJsonAsync<PagedNotificationsResponse>(cancellationToken);

            Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
            Assert.NotNull(notifications);
            Assert.Single(
                notifications.Items,
                item => item.RequestId == created.Id);

            var inboxCount = await GetInboxCountAsync(
                factory,
                outboxMessage.Id,
                cancellationToken);
            Assert.Equal(1, inboxCount);

            using var isolatedResponse = await ListNotificationsAsync(
                client,
                Guid.NewGuid(),
                responsibleUserId,
                cancellationToken);
            var isolated = await isolatedResponse.Content
                .ReadFromJsonAsync<PagedNotificationsResponse>(cancellationToken);

            Assert.NotNull(isolated);
            Assert.Empty(isolated.Items);
        }
        finally
        {
            await factory.DisposeAsync();
            await DeleteTopologyAsync(
                queueName,
                exchangeName,
                retryExchangeName,
                deadLetterExchangeName,
                deadLetterQueueName,
                retryQueueCount,
                additionalQueueName: null,
                cancellationToken);
        }
    }

    [Fact]
    public async Task TransientFailure_ShouldRetryWithBackoffAndMoveToDeadLetter()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var suffix = Guid.NewGuid().ToString("N");
        var queueName = $"civicops.tests.notifications.{suffix}";
        var exchangeName = $"civicops.tests.events.{suffix}";
        var retryExchangeName = $"civicops.tests.retry.{suffix}";
        var deadLetterExchangeName = $"civicops.tests.dead-letter.{suffix}";
        var deadLetterQueueName = $"{queueName}.dead-letter";
        var observerQueueName = $"{queueName}.observer";
        const int retryQueueCount = 3;
        var processor = new AlwaysFailingProcessor();
        var factory = CreateFactory(
            queueName,
            exchangeName,
            retryExchangeName,
            deadLetterExchangeName,
            deadLetterQueueName,
            services =>
            {
                services.RemoveAll<IRequestAssignedNotificationProcessor>();
                services.AddSingleton<IRequestAssignedNotificationProcessor>(
                    processor);
            });

        try
        {
            using var client = factory.CreateClient();
            await DeclareObserverQueueAsync(
                queueName,
                observerQueueName,
                exchangeName,
                cancellationToken);
            var messageId = Guid.NewGuid();
            var payload = JsonSerializer.Serialize(
                new
                {
                    eventId = messageId,
                    tenantId = Guid.NewGuid(),
                    requestId = Guid.NewGuid(),
                    protocolNumber = "2026-000001",
                    responsibleUserId = Guid.NewGuid(),
                    occurredAtUtc = DateTimeOffset.UtcNow
                });

            await PublishAsync(
                messageId,
                payload,
                queueName,
                exchangeName,
                cancellationToken);

            var deadLetter = await WaitForDeadLetterAsync(
                deadLetterQueueName,
                cancellationToken);

            Assert.NotNull(deadLetter);
            Assert.Equal(
                retryQueueCount + 1,
                processor.AttemptCount);
            Assert.Equal(
                retryQueueCount,
                GetIntegerHeader(
                    deadLetter.Headers,
                    "x-civicops-retry-count"));
            Assert.Equal(
                "retries-exhausted",
                GetStringHeader(
                    deadLetter.Headers,
                    "x-civicops-dead-letter-reason"));
            Assert.Equal(
                queueName,
                GetStringHeader(
                    deadLetter.Headers,
                    "x-civicops-original-queue"));
            Assert.Equal(
                1u,
                await GetQueueMessageCountAsync(
                    observerQueueName,
                    cancellationToken));
        }
        finally
        {
            await factory.DisposeAsync();
            await DeleteTopologyAsync(
                queueName,
                exchangeName,
                retryExchangeName,
                deadLetterExchangeName,
                deadLetterQueueName,
                retryQueueCount,
                observerQueueName,
                cancellationToken);
        }
    }

    [Fact]
    public async Task InvalidMessage_ShouldMoveDirectlyToDeadLetter()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var suffix = Guid.NewGuid().ToString("N");
        var queueName = $"civicops.tests.notifications.{suffix}";
        var exchangeName = $"civicops.tests.events.{suffix}";
        var retryExchangeName = $"civicops.tests.retry.{suffix}";
        var deadLetterExchangeName = $"civicops.tests.dead-letter.{suffix}";
        var deadLetterQueueName = $"{queueName}.dead-letter";
        const int retryQueueCount = 3;
        var processor = new CountingProcessor();
        var factory = CreateFactory(
            queueName,
            exchangeName,
            retryExchangeName,
            deadLetterExchangeName,
            deadLetterQueueName,
            services =>
            {
                services.RemoveAll<IRequestAssignedNotificationProcessor>();
                services.AddSingleton<IRequestAssignedNotificationProcessor>(
                    processor);
            });

        try
        {
            using var client = factory.CreateClient();

            await PublishAsync(
                Guid.NewGuid(),
                "{}",
                queueName,
                exchangeName,
                cancellationToken);

            var deadLetter = await WaitForDeadLetterAsync(
                deadLetterQueueName,
                cancellationToken);

            Assert.NotNull(deadLetter);
            Assert.Equal(0, processor.AttemptCount);
            Assert.Equal(
                0,
                GetIntegerHeader(
                    deadLetter.Headers,
                    "x-civicops-retry-count"));
            Assert.Equal(
                "invalid-message",
                GetStringHeader(
                    deadLetter.Headers,
                    "x-civicops-dead-letter-reason"));
        }
        finally
        {
            await factory.DisposeAsync();
            await DeleteTopologyAsync(
                queueName,
                exchangeName,
                retryExchangeName,
                deadLetterExchangeName,
                deadLetterQueueName,
                retryQueueCount,
                additionalQueueName: null,
                cancellationToken);
        }
    }

    private static WebApplicationFactory<Program> CreateFactory(
        string queueName,
        string exchangeName,
        string retryExchangeName,
        string deadLetterExchangeName,
        string deadLetterQueueName,
        Action<IServiceCollection>? configureServices = null)
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("IntegrationTests");
                builder.ConfigureAppConfiguration(
                    (_, configuration) =>
                    {
                        configuration.AddInMemoryCollection(
                                    new Dictionary<string, string?>
                                    {
                                        ["Database:ApplyMigrations"] = "true",
                                        ["OutboxPublisher:Enabled"] = "false",
                                        ["RabbitMq:ExchangeName"] = exchangeName,
                                        ["NotificationsConsumer:Enabled"] = "true",
                                        ["NotificationsConsumer:QueueName"] = queueName,
                                        ["NotificationsConsumer:PrefetchCount"] = "4",
                                        ["NotificationsConsumer:RetryExchangeName"] =
                                    retryExchangeName,
                                        ["NotificationsConsumer:RetryDelays:0"] =
                                    "00:00:00.100",
                                        ["NotificationsConsumer:RetryDelays:1"] =
                                    "00:00:00.250",
                                        ["NotificationsConsumer:RetryDelays:2"] =
                                    "00:00:00.500",
                                        ["NotificationsConsumer:DeadLetterExchangeName"] =
                                    deadLetterExchangeName,
                                        ["NotificationsConsumer:DeadLetterQueueName"] =
                                    deadLetterQueueName
                                    });
                    });

                if (configureServices is not null)
                {
                    builder.ConfigureServices(configureServices);
                }
            });
    }

    private static async Task<CreateRequestResponse> CreateRequestAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", actorUserId.ToString());
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                "Solicitação para notificação",
                "Teste do consumidor idempotente."));

        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken)
            ?? throw new InvalidOperationException("A solicitação não foi retornada.");
    }

    private static async Task<HttpResponseMessage> AssignResponsibleAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        Guid responsibleUserId,
        CreateRequestResponse created,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Patch,
            $"/api/v1/requests/{created.Id}/assignment");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", actorUserId.ToString());
        request.Content = JsonContent.Create(
            new AssignResponsibleRequest(responsibleUserId, created.Version));
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<NotificationListItemResponse?>
        WaitForNotificationAsync(
            HttpClient client,
            Guid tenantId,
            Guid userId,
            Guid requestId,
            CancellationToken cancellationToken)
    {
        var timeoutAt = DateTimeOffset.UtcNow.AddSeconds(30);

        while (DateTimeOffset.UtcNow < timeoutAt)
        {
            using var response = await ListNotificationsAsync(
                client,
                tenantId,
                userId,
                cancellationToken);
            var body = await response.Content
                .ReadFromJsonAsync<PagedNotificationsResponse>(cancellationToken);
            var notification = body?.Items
                .SingleOrDefault(item => item.RequestId == requestId);

            if (notification is not null)
            {
                return notification;
            }

            await Task.Delay(TimeSpan.FromMilliseconds(100), cancellationToken);
        }

        return null;
    }

    private static async Task<HttpResponseMessage> ListNotificationsAsync(
        HttpClient client,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/v1/notifications?page=1&pageSize=100");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", userId.ToString());
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<OutboxTestMessage> GetAssignmentOutboxMessageAsync(
        WebApplicationFactory<Program> factory,
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<RequestsDbContext>();
        var connection = dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText =
            """
            SELECT id, payload::text
              FROM requests.outbox_messages
             WHERE tenant_id = @tenant_id
               AND type = 'requests.responsible-assigned.v1'
               AND payload ->> 'requestId' = @request_id
             ORDER BY occurred_at_utc DESC
             LIMIT 1;
            """;
        AddParameter(command, "tenant_id", tenantId);
        AddParameter(command, "request_id", requestId.ToString());
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            throw new InvalidOperationException("A mensagem Outbox não foi encontrada.");
        }

        return new OutboxTestMessage(reader.GetGuid(0), reader.GetString(1));
    }

    private static async Task PublishDuplicateAsync(
        OutboxTestMessage message,
        string queueName,
        string exchangeName,
        CancellationToken cancellationToken)
    {
        await WaitUntilQueueExistsAsync(
            queueName,
            cancellationToken);

        var factory = CreateRabbitFactory();
        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);
        await using var channel =
            await connection.CreateChannelAsync(cancellationToken: cancellationToken);
        await channel.QueueDeclarePassiveAsync(queueName, cancellationToken);

        var properties = new BasicProperties
        {
            Persistent = true,
            ContentType = "application/json",
            MessageId = message.Id.ToString(),
            Type = "requests.responsible-assigned.v1"
        };
        var body = Encoding.UTF8.GetBytes(message.Payload);

        await channel.BasicPublishAsync(
            exchangeName,
            "requests.responsible-assigned.v1",
            mandatory: false,
            properties,
            body,
            cancellationToken);
        await channel.BasicPublishAsync(
            exchangeName,
            "requests.responsible-assigned.v1",
            mandatory: false,
            properties,
            body,
            cancellationToken);
    }

    private static async Task PublishAsync(
        Guid messageId,
        string payload,
        string queueName,
        string exchangeName,
        CancellationToken cancellationToken)
    {
        await WaitUntilQueueExistsAsync(
            queueName,
            cancellationToken);

        var factory = CreateRabbitFactory();
        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);
        await using var channel =
            await connection.CreateChannelAsync(
                cancellationToken: cancellationToken);
        await channel.QueueDeclarePassiveAsync(
            queueName,
            cancellationToken);

        var properties = new BasicProperties
        {
            Persistent = true,
            ContentType = "application/json",
            MessageId = messageId.ToString(),
            Type = "requests.responsible-assigned.v1"
        };

        await channel.BasicPublishAsync(
            exchangeName,
            "requests.responsible-assigned.v1",
            mandatory: true,
            properties,
            Encoding.UTF8.GetBytes(payload),
            cancellationToken);
    }

    private static async Task WaitUntilQueueExistsAsync(
        string queueName,
        CancellationToken cancellationToken)
    {
        var timeoutAt = DateTimeOffset.UtcNow.AddSeconds(15);

        while (DateTimeOffset.UtcNow < timeoutAt)
        {
            try
            {
                var factory = CreateRabbitFactory();
                await using var connection =
                    await factory.CreateConnectionAsync(cancellationToken);
                await using var channel =
                    await connection.CreateChannelAsync(
                        cancellationToken: cancellationToken);
                await channel.QueueDeclarePassiveAsync(
                    queueName,
                    cancellationToken);
                return;
            }
            catch (OperationInterruptedException)
            {
                await Task.Delay(
                    TimeSpan.FromMilliseconds(50),
                    cancellationToken);
            }
        }

        throw new TimeoutException(
            $"A fila de teste {queueName} não foi declarada.");
    }

    private static async Task DeclareObserverQueueAsync(
        string sourceQueueName,
        string observerQueueName,
        string exchangeName,
        CancellationToken cancellationToken)
    {
        await WaitUntilQueueExistsAsync(
            sourceQueueName,
            cancellationToken);

        var factory = CreateRabbitFactory();
        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);
        await using var channel =
            await connection.CreateChannelAsync(
                cancellationToken: cancellationToken);
        await channel.QueueDeclareAsync(
            observerQueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);
        await channel.QueueBindAsync(
            observerQueueName,
            exchangeName,
            "requests.responsible-assigned.v1",
            arguments: null,
            cancellationToken: cancellationToken);
    }

    private static async Task<uint> GetQueueMessageCountAsync(
        string queueName,
        CancellationToken cancellationToken)
    {
        var factory = CreateRabbitFactory();
        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);
        await using var channel =
            await connection.CreateChannelAsync(
                cancellationToken: cancellationToken);
        var queue = await channel.QueueDeclarePassiveAsync(
            queueName,
            cancellationToken);
        return queue.MessageCount;
    }

    private static async Task<DeadLetterTestMessage?> WaitForDeadLetterAsync(
        string queueName,
        CancellationToken cancellationToken)
    {
        var factory = CreateRabbitFactory();
        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);
        await using var channel =
            await connection.CreateChannelAsync(
                cancellationToken: cancellationToken);
        await channel.QueueDeclarePassiveAsync(
            queueName,
            cancellationToken);

        var timeoutAt = DateTimeOffset.UtcNow.AddSeconds(15);

        while (DateTimeOffset.UtcNow < timeoutAt)
        {
            var result = await channel.BasicGetAsync(
                queueName,
                autoAck: true,
                cancellationToken);

            if (result is not null)
            {
                return new DeadLetterTestMessage(
                    result.BasicProperties.Headers);
            }

            await Task.Delay(
                TimeSpan.FromMilliseconds(50),
                cancellationToken);
        }

        return null;
    }

    private static async Task WaitUntilQueueIsEmptyAsync(
        string queueName,
        CancellationToken cancellationToken)
    {
        var factory = CreateRabbitFactory();
        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);
        await using var channel =
            await connection.CreateChannelAsync(cancellationToken: cancellationToken);
        var timeoutAt = DateTimeOffset.UtcNow.AddSeconds(15);

        while (DateTimeOffset.UtcNow < timeoutAt)
        {
            var queue = await channel.QueueDeclarePassiveAsync(
                queueName,
                cancellationToken);

            if (queue.MessageCount == 0)
            {
                return;
            }

            await Task.Delay(TimeSpan.FromMilliseconds(100), cancellationToken);
        }

        throw new TimeoutException("A fila de teste não foi drenada.");
    }

    private static async Task<long> GetInboxCountAsync(
        WebApplicationFactory<Program> factory,
        Guid messageId,
        CancellationToken cancellationToken)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext =
            scope.ServiceProvider.GetRequiredService<NotificationsDbContext>();
        var connection = dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText =
            """
            SELECT COUNT(*)
              FROM notifications.processed_messages AS inbox
              JOIN notifications.notifications AS notification
                ON notification.source_message_id = inbox.message_id
             WHERE inbox.message_id = @message_id;
            """;
        AddParameter(command, "message_id", messageId);
        return Convert.ToInt64(
            await command.ExecuteScalarAsync(cancellationToken));
    }

    private static async Task DeleteTopologyAsync(
        string queueName,
        string exchangeName,
        string retryExchangeName,
        string deadLetterExchangeName,
        string deadLetterQueueName,
        int retryQueueCount,
        string? additionalQueueName,
        CancellationToken cancellationToken)
    {
        var factory = CreateRabbitFactory();
        await using var connection =
            await factory.CreateConnectionAsync(cancellationToken);
        await using var channel =
            await connection.CreateChannelAsync(cancellationToken: cancellationToken);
        await channel.QueueDeleteAsync(
            queueName,
            ifUnused: false,
            ifEmpty: false,
            cancellationToken: cancellationToken);
        for (var attempt = 1; attempt <= retryQueueCount; attempt++)
        {
            await channel.QueueDeleteAsync(
                $"{queueName}.retry.{attempt}",
                ifUnused: false,
                ifEmpty: false,
                cancellationToken: cancellationToken);
        }

        await channel.QueueDeleteAsync(
            deadLetterQueueName,
            ifUnused: false,
            ifEmpty: false,
            cancellationToken: cancellationToken);
        if (additionalQueueName is not null)
        {
            await channel.QueueDeleteAsync(
                additionalQueueName,
                ifUnused: false,
                ifEmpty: false,
                cancellationToken: cancellationToken);
        }

        await channel.ExchangeDeleteAsync(
            exchangeName,
            ifUnused: false,
            cancellationToken: cancellationToken);
        await channel.ExchangeDeleteAsync(
            retryExchangeName,
            ifUnused: false,
            cancellationToken: cancellationToken);
        await channel.ExchangeDeleteAsync(
            deadLetterExchangeName,
            ifUnused: false,
            cancellationToken: cancellationToken);
    }

    private static ConnectionFactory CreateRabbitFactory()
    {
        return new ConnectionFactory
        {
            HostName = "localhost",
            Port = 5672,
            UserName = "civic_ops",
            Password = "civic_ops_dev"
        };
    }

    private static int GetIntegerHeader(
        IDictionary<string, object?>? headers,
        string name)
    {
        Assert.NotNull(headers);
        Assert.True(headers.TryGetValue(name, out var value));

        return value switch
        {
            byte typed => typed,
            short typed => typed,
            int typed => typed,
            long typed => checked((int)typed),
            byte[] bytes => int.Parse(Encoding.UTF8.GetString(bytes)),
            _ => throw new InvalidOperationException(
                $"O header {name} não contém um inteiro.")
        };
    }

    private static string GetStringHeader(
        IDictionary<string, object?>? headers,
        string name)
    {
        Assert.NotNull(headers);
        Assert.True(headers.TryGetValue(name, out var value));

        return value switch
        {
            byte[] bytes => Encoding.UTF8.GetString(bytes),
            string typed => typed,
            _ => throw new InvalidOperationException(
                $"O header {name} não contém texto.")
        };
    }

    private static void AddParameter(
        System.Data.Common.DbCommand command,
        string name,
        object value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value;
        command.Parameters.Add(parameter);
    }

    private sealed record OutboxTestMessage(Guid Id, string Payload);

    private sealed record DeadLetterTestMessage(
        IDictionary<string, object?>? Headers);

    private sealed class AlwaysFailingProcessor :
        IRequestAssignedNotificationProcessor
    {
        private int _attemptCount;

        public int AttemptCount => Volatile.Read(ref _attemptCount);

        public Task<ProcessNotificationResult> ProcessAsync(
            ProcessRequestAssignedCommand command,
            CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref _attemptCount);
            throw new InvalidOperationException(
                "Falha transitória simulada.");
        }
    }

    private sealed class CountingProcessor :
        IRequestAssignedNotificationProcessor
    {
        private int _attemptCount;

        public int AttemptCount => Volatile.Read(ref _attemptCount);

        public Task<ProcessNotificationResult> ProcessAsync(
            ProcessRequestAssignedCommand command,
            CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref _attemptCount);
            return Task.FromResult(
                new ProcessNotificationResult(true, Guid.NewGuid()));
        }
    }
}

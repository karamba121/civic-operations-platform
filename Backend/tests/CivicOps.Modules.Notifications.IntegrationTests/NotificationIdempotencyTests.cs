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
using RabbitMQ.Client;
using System.Data;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using Xunit;

namespace CivicOps.Modules.Notifications.IntegrationTests;

public sealed class NotificationIdempotencyTests
{
    [Fact]
    public async Task Assignment_ShouldCreateSingleNotificationForDuplicateMessage()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var queueName = $"civicops.tests.notifications.{Guid.NewGuid():N}";
        var factory = CreateFactory(queueName);

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
            await DeleteQueueAsync(queueName, cancellationToken);
        }
    }

    private static WebApplicationFactory<Program> CreateFactory(string queueName)
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
                                ["NotificationsConsumer:Enabled"] = "true",
                                ["NotificationsConsumer:QueueName"] = queueName,
                                ["NotificationsConsumer:PrefetchCount"] = "4"
                            });
                    });
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
        CancellationToken cancellationToken)
    {
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
            "civicops.events",
            "requests.responsible-assigned.v1",
            mandatory: false,
            properties,
            body,
            cancellationToken);
        await channel.BasicPublishAsync(
            "civicops.events",
            "requests.responsible-assigned.v1",
            mandatory: false,
            properties,
            body,
            cancellationToken);
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

    private static async Task DeleteQueueAsync(
        string queueName,
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
}

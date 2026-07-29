using CivicOps.Modules.Requests.Infrastructure.Persistence;
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
using System.Text.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class OutboxRabbitMqPublishingTests
{
    [Fact]
    public async Task Publisher_ShouldConfirmMessageAndMarkOutboxAsProcessed()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var rabbitFactory = new ConnectionFactory
        {
            HostName = "localhost",
            Port = 5672,
            UserName = "civic_ops",
            Password = "civic_ops_dev"
        };
        await using var connection = await rabbitFactory.CreateConnectionAsync(
            cancellationToken);
        await using var channel = await connection.CreateChannelAsync(
            cancellationToken: cancellationToken);
        await channel.ExchangeDeclareAsync(
            "civicops.events",
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);
        var queue = await channel.QueueDeclareAsync(
            queue: string.Empty,
            durable: false,
            exclusive: true,
            autoDelete: true,
            arguments: null,
            cancellationToken: cancellationToken);
        await channel.QueueBindAsync(
            queue.QueueName,
            "civicops.events",
            "requests.#",
            arguments: null,
            cancellationToken: cancellationToken);

        await using var factory = CreateFactory();
        var configuration =
            factory.Services.GetRequiredService<IConfiguration>();
        Assert.Equal("true", configuration["OutboxPublisher:Enabled"]);
        using var client = factory.CreateClient();
        var tenantId = Guid.NewGuid();
        var actorUserId = Guid.NewGuid();

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", actorUserId.ToString());
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                "Publicação no RabbitMQ",
                "Validação real da publicação da Outbox."));

        using var response = await client.SendAsync(request, cancellationToken);
        var created = await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(created);

        var delivery = await WaitForRequestMessageAsync(
            channel,
            queue.QueueName,
            created.Id,
            cancellationToken);

        Assert.NotNull(delivery);
        Assert.Equal("requests.request-created.v1", delivery.BasicProperties.Type);
        Assert.True(delivery.BasicProperties.Persistent);

        var processed = await WaitUntilProcessedAsync(
            factory,
            tenantId,
            created.Id,
            cancellationToken);

        Assert.True(processed);
    }

    private static WebApplicationFactory<Program> CreateFactory()
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
                                ["OutboxPublisher:Enabled"] = "true",
                                ["OutboxPublisher:BatchSize"] = "500",
                                ["OutboxPublisher:PollingInterval"] = "00:00:00.100",
                                ["OutboxPublisher:FailureDelay"] = "00:00:00.100"
                            });
                    });
            });
    }

    private static async Task<BasicGetResult?> WaitForRequestMessageAsync(
        IChannel channel,
        string queueName,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        var timeoutAt = DateTimeOffset.UtcNow.AddSeconds(30);

        while (DateTimeOffset.UtcNow < timeoutAt)
        {
            var delivery = await channel.BasicGetAsync(
                queueName,
                autoAck: true,
                cancellationToken);

            if (delivery is not null)
            {
                using var document = JsonDocument.Parse(delivery.Body);

                if (document.RootElement.GetProperty("requestId").GetGuid() == requestId)
                {
                    return delivery;
                }
            }

            await Task.Delay(TimeSpan.FromMilliseconds(100), cancellationToken);
        }

        return null;
    }

    private static async Task<bool> WaitUntilProcessedAsync(
        WebApplicationFactory<Program> factory,
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        var timeoutAt = DateTimeOffset.UtcNow.AddSeconds(10);

        while (DateTimeOffset.UtcNow < timeoutAt)
        {
            await using var scope = factory.Services.CreateAsyncScope();
            var dbContext =
                scope.ServiceProvider.GetRequiredService<RequestsDbContext>();
            var connection = dbContext.Database.GetDbConnection();

            if (connection.State != ConnectionState.Open)
            {
                await connection.OpenAsync(cancellationToken);
            }

            await using var command = connection.CreateCommand();
            command.CommandText =
                """
                SELECT COUNT(*)
                  FROM requests.outbox_messages
                 WHERE tenant_id = @tenant_id
                   AND payload ->> 'requestId' = @request_id
                   AND processed_at_utc IS NOT NULL;
                """;

            var tenantParameter = command.CreateParameter();
            tenantParameter.ParameterName = "tenant_id";
            tenantParameter.Value = tenantId;
            command.Parameters.Add(tenantParameter);

            var requestParameter = command.CreateParameter();
            requestParameter.ParameterName = "request_id";
            requestParameter.Value = requestId.ToString();
            command.Parameters.Add(requestParameter);

            if (Convert.ToInt64(
                    await command.ExecuteScalarAsync(cancellationToken)) == 1)
            {
                return true;
            }

            await Task.Delay(TimeSpan.FromMilliseconds(100), cancellationToken);
        }

        return false;
    }
}

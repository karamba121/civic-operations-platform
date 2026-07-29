using CivicOps.Modules.Requests.Infrastructure.Persistence;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using System.Data;
using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class OutboxRabbitMqPublishingTests
{
    [Fact]
    public async Task Publisher_ShouldConfirmMessageAndMarkOutboxAsProcessed()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var exchangeName =
            $"civicops.tests.outbox.{Guid.NewGuid():N}";
        var expectedTraceId = ActivityTraceId.CreateRandom();
        var incomingSpanId = ActivitySpanId.CreateRandom();
        var incomingTraceParent =
            $"00-{expectedTraceId}-{incomingSpanId}-01";
        const string incomingTraceState = "civicops=test";
        const string incomingBaggage =
            "municipality=integration-test";
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
            exchangeName,
            ExchangeType.Topic,
            durable: true,
            autoDelete: false,
            arguments: null,
            cancellationToken: cancellationToken);
        await using var exchangeCleanup =
            new RabbitExchangeCleanup(channel, exchangeName);
        var queue = await channel.QueueDeclareAsync(
            queue: string.Empty,
            durable: false,
            exclusive: true,
            autoDelete: true,
            arguments: null,
            cancellationToken: cancellationToken);
        await channel.QueueBindAsync(
            queue.QueueName,
            exchangeName,
            "requests.#",
            arguments: null,
            cancellationToken: cancellationToken);

        await using var factory = CreateFactory(exchangeName);
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
        request.Headers.TryAddWithoutValidation(
            "traceparent",
            incomingTraceParent);
        request.Headers.TryAddWithoutValidation(
            "tracestate",
            incomingTraceState);
        request.Headers.TryAddWithoutValidation(
            "baggage",
            incomingBaggage);
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
        var publishedTraceParent = GetHeader(
            delivery.BasicProperties.Headers,
            "traceparent");
        var publishedTraceState = GetHeader(
            delivery.BasicProperties.Headers,
            "tracestate");
        var publishedBaggage = GetHeader(
            delivery.BasicProperties.Headers,
            "baggage");

        Assert.True(ActivityContext.TryParse(
            publishedTraceParent,
            publishedTraceState,
            isRemote: true,
            out var publishedContext));
        Assert.Equal(expectedTraceId, publishedContext.TraceId);
        Assert.NotEqual(incomingSpanId, publishedContext.SpanId);
        Assert.Equal(incomingTraceState, publishedTraceState);
        Assert.Contains(
            "municipality",
            publishedBaggage,
            StringComparison.Ordinal);
        Assert.Contains(
            "integration-test",
            publishedBaggage,
            StringComparison.Ordinal);

        var processed = await WaitUntilProcessedAsync(
            factory,
            tenantId,
            created.Id,
            cancellationToken);

        Assert.True(processed);

    }

    private static WebApplicationFactory<Program> CreateFactory(
        string exchangeName)
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
                                ["RabbitMq:ExchangeName"] = exchangeName,
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

    private static string? GetHeader(
        IDictionary<string, object?>? headers,
        string name)
    {
        if (headers is null ||
            !headers.TryGetValue(name, out var value))
        {
            return null;
        }

        return value switch
        {
            byte[] bytes => Encoding.UTF8.GetString(bytes),
            string text => text,
            _ => value?.ToString()
        };
    }

    private sealed class RabbitExchangeCleanup(
        IChannel channel,
        string exchangeName) : IAsyncDisposable
    {
        public async ValueTask DisposeAsync()
        {
            if (channel.IsOpen)
            {
                await channel.ExchangeDeleteAsync(
                    exchangeName,
                    ifUnused: false);
            }
        }
    }
}

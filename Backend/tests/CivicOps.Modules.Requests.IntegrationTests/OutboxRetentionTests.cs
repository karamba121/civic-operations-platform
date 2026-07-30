using Xunit;
using CivicOps.Modules.Requests.Infrastructure.Outbox;
using CivicOps.Modules.Requests.Infrastructure.Persistence;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class OutboxRetentionTests
{
    [Fact]
    public async Task Cleanup_ShouldDeleteOnlyExpiredProcessedMessages()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();

        for (var index = 0; index < 3; index++)
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "/api/v1/requests");
            request.Headers.Add("X-Tenant-Id", tenantId.ToString());
            request.Headers.Add("X-User-Id", Guid.NewGuid().ToString());
            request.Headers.Add(
                "Idempotency-Key",
                Guid.NewGuid().ToString());
            request.Content = JsonContent.Create(
                new CreateRequestRequest(
                    $"Retenção da Outbox {index}",
                    "Solicitação criada para validar a retenção."));

            using var response =
                await client.SendAsync(request, cancellationToken);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext =
            scope.ServiceProvider.GetRequiredService<RequestsDbContext>();
        var messageIds = await dbContext.OutboxMessages
            .Where(message => message.TenantId == tenantId)
            .OrderBy(message => message.OccurredAtUtc)
            .Select(message => message.Id)
            .ToListAsync(cancellationToken);
        Assert.Equal(3, messageIds.Count);

        var nowUtc = DateTimeOffset.UtcNow;
        var expiredProcessedAtUtc = nowUtc.AddDays(-31);
        var retainedProcessedAtUtc = nowUtc.AddDays(-10);

        await dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"""
            UPDATE requests.outbox_messages
            SET processed_at_utc = {expiredProcessedAtUtc}
            WHERE id = {messageIds[0]};

            UPDATE requests.outbox_messages
            SET processed_at_utc = {retainedProcessedAtUtc}
            WHERE id = {messageIds[1]};

            UPDATE requests.outbox_messages
            SET occurred_at_utc = {expiredProcessedAtUtc},
                processed_at_utc = NULL,
                attempt_count = 3,
                last_error = 'Falha preservada pela retenção.'
            WHERE id = {messageIds[2]};
            """,
            cancellationToken);

        var store =
            scope.ServiceProvider.GetRequiredService<IOutboxMessageStore>();
        var removed = await store.DeleteProcessedBatchAsync(
            nowUtc.AddDays(-30),
            100,
            cancellationToken);

        Assert.Equal(1, removed);
        var remainingIds = await dbContext.OutboxMessages
            .Where(message => message.TenantId == tenantId)
            .Select(message => message.Id)
            .ToListAsync(cancellationToken);
        Assert.DoesNotContain(messageIds[0], remainingIds);
        Assert.Contains(messageIds[1], remainingIds);
        Assert.Contains(messageIds[2], remainingIds);
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
                                ["OutboxMetrics:Enabled"] = "false",
                                ["OutboxRetention:Enabled"] = "false"
                            });
                    });
            });
    }
}

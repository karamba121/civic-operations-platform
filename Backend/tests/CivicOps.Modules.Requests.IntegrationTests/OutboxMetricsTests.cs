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

public sealed class OutboxMetricsTests
{
    [Fact]
    public async Task Snapshot_ShouldDescribeCurrentBacklogWithoutTenantLabels()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var nowUtc = DateTimeOffset.UtcNow;

        await using var beforeScope = factory.Services.CreateAsyncScope();
        var beforeStore = beforeScope.ServiceProvider
            .GetRequiredService<IOutboxMessageStore>();
        var before = await beforeStore.GetMetricsAsync(
            nowUtc,
            cancellationToken);

        var tenantId = Guid.NewGuid();
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", Guid.NewGuid().ToString());
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                "Métricas da Outbox",
                "Solicitação criada para validar o snapshot operacional."));

        using var response = await client.SendAsync(request, cancellationToken);
        var created = await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(created);

        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider
            .GetRequiredService<RequestsDbContext>();
        var lockId = Guid.NewGuid();
        var occurredAtUtc = nowUtc.AddMinutes(-10);
        var lockedUntilUtc = nowUtc.AddMinutes(5);
        var requestId = created.Id.ToString();

        var updated = await dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"""
            UPDATE requests.outbox_messages
               SET occurred_at_utc = {occurredAtUtc},
                   attempt_count = 3,
                   lock_id = {lockId},
                   locked_until_utc = {lockedUntilUtc}
             WHERE tenant_id = {tenantId}
               AND payload ->> 'requestId' = {requestId};
            """,
            cancellationToken);

        Assert.Equal(1, updated);

        var store = scope.ServiceProvider.GetRequiredService<IOutboxMessageStore>();
        var snapshot = await store.GetMetricsAsync(nowUtc, cancellationToken);

        Assert.True(snapshot.PendingMessages >= before.PendingMessages + 1);
        Assert.True(snapshot.RetryingMessages >= before.RetryingMessages + 1);
        Assert.True(snapshot.LeasedMessages >= before.LeasedMessages + 1);
        Assert.True(snapshot.PendingAttempts >= before.PendingAttempts + 3);
        Assert.True(snapshot.OldestPendingAgeSeconds >= 9 * 60);
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
                                ["OutboxMetrics:Enabled"] = "false"
                            });
                    });
            });
    }
}

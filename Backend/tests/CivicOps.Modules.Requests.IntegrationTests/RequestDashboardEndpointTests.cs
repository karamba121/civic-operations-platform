using CivicOps.Modules.Requests.Presentation;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using CivicOps.Modules.Requests.Presentation.GetRequestDashboard;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class RequestDashboardEndpointTests
{
    [Fact]
    public async Task Dashboard_ShouldProjectOperationalSummaryAndIsolateTenant()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var clock = new AdjustableTimeProvider(
            new DateTimeOffset(2026, 1, 1, 8, 0, 0, TimeSpan.Zero));
        await using var factory = CreateFactory(clock);
        using var client = factory.CreateClient();
        var tenantId = Guid.NewGuid();
        var otherTenantId = Guid.NewGuid();
        var actorUserId = Guid.NewGuid();

        var overdue = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            "Prazo vencido",
            cancellationToken);
        clock.Advance(TimeSpan.FromMinutes(1));
        var dueSoon = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            "Prazo próximo",
            cancellationToken);
        clock.Advance(TimeSpan.FromMinutes(1));
        var assigned = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            "Em atendimento",
            cancellationToken);
        clock.Advance(TimeSpan.FromMinutes(1));
        var completed = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            "Concluída",
            cancellationToken);
        clock.Advance(TimeSpan.FromMinutes(1));
        var cancelled = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            "Cancelada",
            cancellationToken);
        var isolated = await CreateAsync(
            client,
            otherTenantId,
            actorUserId,
            "Outro tenant",
            cancellationToken);

        overdue = await SetDueDateAsync(
            client,
            tenantId,
            actorUserId,
            overdue,
            new DateTimeOffset(2026, 1, 5, 0, 0, 0, TimeSpan.Zero),
            cancellationToken);
        dueSoon = await SetDueDateAsync(
            client,
            tenantId,
            actorUserId,
            dueSoon,
            new DateTimeOffset(2026, 1, 15, 0, 0, 0, TimeSpan.Zero),
            cancellationToken);

        assigned = await AssignAsync(
            client,
            tenantId,
            actorUserId,
            assigned,
            Guid.NewGuid(),
            cancellationToken);
        assigned = await ChangeStatusAsync(
            client,
            tenantId,
            actorUserId,
            assigned,
            "InProgress",
            cancellationToken);

        completed = await ChangeStatusAsync(
            client,
            tenantId,
            actorUserId,
            completed,
            "InProgress",
            cancellationToken);
        completed = await ChangeStatusAsync(
            client,
            tenantId,
            actorUserId,
            completed,
            "Completed",
            cancellationToken);
        cancelled = await ChangeStatusAsync(
            client,
            tenantId,
            actorUserId,
            cancelled,
            "Cancelled",
            cancellationToken);

        clock.SetUtcNow(
            new DateTimeOffset(2026, 1, 10, 12, 0, 0, TimeSpan.Zero));

        var dashboard = await GetDashboardAsync(
            client,
            tenantId,
            cancellationToken);

        Assert.Equal(5, dashboard.Total);
        Assert.Equal(2, dashboard.Submitted);
        Assert.Equal(1, dashboard.InProgress);
        Assert.Equal(1, dashboard.Completed);
        Assert.Equal(1, dashboard.Cancelled);
        Assert.Equal(1, dashboard.Overdue);
        Assert.Equal(1, dashboard.DueSoon);
        Assert.Equal(2, dashboard.UnassignedActive);
        Assert.Equal(5, dashboard.Recent.Count);
        Assert.DoesNotContain(
            dashboard.Recent,
            item => item.Id == isolated.Id);
        Assert.Equal(
            dashboard.Recent
                .OrderByDescending(item => item.CreatedAtUtc)
                .ThenByDescending(item => item.Id)
                .Select(item => item.Id),
            dashboard.Recent.Select(item => item.Id));

        var isolatedDashboard = await GetDashboardAsync(
            client,
            otherTenantId,
            cancellationToken);
        Assert.Equal(1, isolatedDashboard.Total);
        Assert.Equal(isolated.Id, Assert.Single(isolatedDashboard.Recent).Id);
    }

    [Fact]
    public async Task Dashboard_ShouldRequireTenantHeader()
    {
        var clock = new AdjustableTimeProvider(DateTimeOffset.UtcNow);
        await using var factory = CreateFactory(clock);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(
            "/api/v1/requests/dashboard",
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Dashboard_ShouldReturnZeroesForEmptyTenant()
    {
        var clock = new AdjustableTimeProvider(DateTimeOffset.UtcNow);
        await using var factory = CreateFactory(clock);
        using var client = factory.CreateClient();

        var dashboard = await GetDashboardAsync(
            client,
            Guid.NewGuid(),
            TestContext.Current.CancellationToken);

        Assert.Equal(0, dashboard.Total);
        Assert.Equal(0, dashboard.Submitted);
        Assert.Equal(0, dashboard.InProgress);
        Assert.Equal(0, dashboard.Completed);
        Assert.Equal(0, dashboard.Cancelled);
        Assert.Equal(0, dashboard.Overdue);
        Assert.Equal(0, dashboard.DueSoon);
        Assert.Equal(0, dashboard.UnassignedActive);
        Assert.Empty(dashboard.Recent);
    }

    private static WebApplicationFactory<Program> CreateFactory(
        AdjustableTimeProvider clock)
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
                                ["Database:ApplyMigrations"] = "true"
                            });
                    });
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll<TimeProvider>();
                    services.AddSingleton<TimeProvider>(clock);
                });
            });
    }

    private static async Task<RequestMutationResponse> CreateAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        string title,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(
            HttpMethod.Post,
            "/api/v1/requests",
            tenantId,
            actorUserId);
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(title, $"Descrição de {title}."));

        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        var created = await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken)
            ?? throw new InvalidOperationException(
                "A solicitação não foi retornada.");
        return new RequestMutationResponse(
            created.Id,
            created.ProtocolNumber,
            created.Status,
            ResponsibleUserId: null,
            DueDateUtc: null,
            created.Version);
    }

    private static async Task<RequestMutationResponse> SetDueDateAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        RequestMutationResponse request,
        DateTimeOffset dueDateUtc,
        CancellationToken cancellationToken)
    {
        using var message = CreateRequest(
            HttpMethod.Patch,
            $"/api/v1/requests/{request.Id}/due-date",
            tenantId,
            actorUserId);
        message.Content = JsonContent.Create(
            new { dueDateUtc, version = request.Version });
        return await SendMutationAsync(client, message, cancellationToken);
    }

    private static async Task<RequestMutationResponse> AssignAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        RequestMutationResponse request,
        Guid responsibleUserId,
        CancellationToken cancellationToken)
    {
        using var message = CreateRequest(
            HttpMethod.Patch,
            $"/api/v1/requests/{request.Id}/assignment",
            tenantId,
            actorUserId);
        message.Content = JsonContent.Create(
            new { responsibleUserId, version = request.Version });
        return await SendMutationAsync(client, message, cancellationToken);
    }

    private static async Task<RequestMutationResponse> ChangeStatusAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        RequestMutationResponse request,
        string status,
        CancellationToken cancellationToken)
    {
        using var message = CreateRequest(
            HttpMethod.Patch,
            $"/api/v1/requests/{request.Id}/status",
            tenantId,
            actorUserId);
        message.Content = JsonContent.Create(
            new { status, version = request.Version });
        return await SendMutationAsync(client, message, cancellationToken);
    }

    private static async Task<RequestMutationResponse> SendMutationAsync(
        HttpClient client,
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content
            .ReadFromJsonAsync<RequestMutationResponse>(cancellationToken)
            ?? throw new InvalidOperationException(
                "A mutação não retornou a solicitação.");
    }

    private static async Task<RequestDashboardResponse> GetDashboardAsync(
        HttpClient client,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        using var request = CreateRequest(
            HttpMethod.Get,
            "/api/v1/requests/dashboard",
            tenantId,
            Guid.NewGuid());
        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content
            .ReadFromJsonAsync<RequestDashboardResponse>(cancellationToken)
            ?? throw new InvalidOperationException(
                "O dashboard não foi retornado.");
    }

    private static HttpRequestMessage CreateRequest(
        HttpMethod method,
        string uri,
        Guid tenantId,
        Guid actorUserId)
    {
        var request = new HttpRequestMessage(method, uri);
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", actorUserId.ToString());
        return request;
    }

    private sealed class AdjustableTimeProvider(DateTimeOffset utcNow)
        : TimeProvider
    {
        private DateTimeOffset currentUtcNow = utcNow;

        public override DateTimeOffset GetUtcNow() => currentUtcNow;

        public void Advance(TimeSpan duration)
        {
            currentUtcNow = currentUtcNow.Add(duration);
        }

        public void SetUtcNow(DateTimeOffset value)
        {
            currentUtcNow = value;
        }
    }

}

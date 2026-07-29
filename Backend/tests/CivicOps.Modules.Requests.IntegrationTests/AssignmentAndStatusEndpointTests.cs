using CivicOps.Modules.Requests.Presentation;
using CivicOps.Modules.Requests.Presentation.AssignResponsible;
using CivicOps.Modules.Requests.Presentation.ChangeRequestStatus;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using CivicOps.Modules.Requests.Presentation.GetRequestDetails;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class AssignmentAndStatusEndpointTests
{
    [Fact]
    public async Task Assignment_ShouldPersistAndEnforceVersionAndTenant()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);
        var responsibleUserId = Guid.NewGuid();

        using var assignmentResponse = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/assignment",
            tenantId,
            new AssignResponsibleRequest(responsibleUserId, created.Version),
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, assignmentResponse.StatusCode);

        var assigned = await assignmentResponse.Content
            .ReadFromJsonAsync<RequestMutationResponse>(cancellationToken);

        Assert.NotNull(assigned);
        Assert.Equal(responsibleUserId, assigned.ResponsibleUserId);
        Assert.NotEqual(created.Version, assigned.Version);

        using var detailsResponse = await GetAsync(
            client,
            $"/api/v1/requests/{created.Id}",
            tenantId,
            cancellationToken);
        var details = await detailsResponse.Content
            .ReadFromJsonAsync<RequestDetailsResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, detailsResponse.StatusCode);
        Assert.NotNull(details);
        Assert.Equal(responsibleUserId, details.ResponsibleUserId);

        using var staleResponse = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/assignment",
            tenantId,
            new AssignResponsibleRequest(Guid.NewGuid(), created.Version),
            cancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, staleResponse.StatusCode);

        using var isolatedResponse = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/assignment",
            Guid.NewGuid(),
            new AssignResponsibleRequest(Guid.NewGuid(), assigned.Version),
            cancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, isolatedResponse.StatusCode);
    }

    [Fact]
    public async Task Status_ShouldFollowWorkflowAndProtectTerminalState()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);

        using var inProgressResponse = await ChangeStatusAsync(
            client,
            tenantId,
            created.Id,
            "InProgress",
            created.Version,
            cancellationToken);
        var inProgress = await inProgressResponse.Content
            .ReadFromJsonAsync<RequestMutationResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, inProgressResponse.StatusCode);
        Assert.NotNull(inProgress);
        Assert.Equal("InProgress", inProgress.Status);

        using var completedResponse = await ChangeStatusAsync(
            client,
            tenantId,
            created.Id,
            "Completed",
            inProgress.Version,
            cancellationToken);
        var completed = await completedResponse.Content
            .ReadFromJsonAsync<RequestMutationResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, completedResponse.StatusCode);
        Assert.NotNull(completed);
        Assert.Equal("Completed", completed.Status);

        using var terminalAssignment = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/assignment",
            tenantId,
            new AssignResponsibleRequest(Guid.NewGuid(), completed.Version),
            cancellationToken);

        Assert.Equal(
            HttpStatusCode.UnprocessableEntity,
            terminalAssignment.StatusCode);

        using var invalidTransition = await ChangeStatusAsync(
            client,
            tenantId,
            created.Id,
            "Cancelled",
            completed.Version,
            cancellationToken);

        Assert.Equal(
            HttpStatusCode.UnprocessableEntity,
            invalidTransition.StatusCode);
    }

    [Fact]
    public async Task Status_ShouldAllowOnlyOneConcurrentUpdateForSameVersion()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);

        var updates = new[]
        {
            ChangeStatusAsync(
                client,
                tenantId,
                created.Id,
                "InProgress",
                created.Version,
                cancellationToken),
            ChangeStatusAsync(
                client,
                tenantId,
                created.Id,
                "Cancelled",
                created.Version,
                cancellationToken)
        };

        var responses = await Task.WhenAll(updates);
        var statusCodes = responses
            .Select(response => response.StatusCode)
            .OrderBy(status => status)
            .ToArray();

        Assert.Contains(HttpStatusCode.OK, statusCodes);
        Assert.Contains(HttpStatusCode.Conflict, statusCodes);

        foreach (var response in responses)
        {
            response.Dispose();
        }
    }

    [Fact]
    public async Task Status_ShouldRejectUnknownValue()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);

        using var response = await ChangeStatusAsync(
            client,
            tenantId,
            created.Id,
            "Unknown",
            created.Version,
            cancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
                                ["Database:ApplyMigrations"] = "true"
                            });
                    });
            });
    }

    private static async Task<CreateRequestResponse> CreateAsync(
        HttpClient client,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", Guid.NewGuid().ToString());
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                "Solicitação para workflow",
                "Descrição da solicitação."));

        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken)
            ?? throw new InvalidOperationException("A API não retornou a solicitação.");
    }

    private static Task<HttpResponseMessage> ChangeStatusAsync(
        HttpClient client,
        Guid tenantId,
        Guid requestId,
        string status,
        Guid version,
        CancellationToken cancellationToken)
    {
        return PatchAsync(
            client,
            $"/api/v1/requests/{requestId}/status",
            tenantId,
            new ChangeRequestStatusRequest(status, version),
            cancellationToken);
    }

    private static async Task<HttpResponseMessage> PatchAsync<TBody>(
        HttpClient client,
        string uri,
        Guid tenantId,
        TBody body,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, uri);
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(body);
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<HttpResponseMessage> GetAsync(
        HttpClient client,
        string uri,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, uri);
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", Guid.NewGuid().ToString());
        return await client.SendAsync(request, cancellationToken);
    }
}

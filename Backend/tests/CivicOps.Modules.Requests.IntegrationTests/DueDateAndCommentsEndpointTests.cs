using CivicOps.Modules.Requests.Presentation;
using CivicOps.Modules.Requests.Presentation.AddRequestComment;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using CivicOps.Modules.Requests.Presentation.GetRequestDetails;
using CivicOps.Modules.Requests.Presentation.ListRequestComments;
using CivicOps.Modules.Requests.Presentation.SetRequestDueDate;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class DueDateAndCommentsEndpointTests
{
    [Fact]
    public async Task DueDate_ShouldPersistAndEnforceConcurrency()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);
        var futureDate = DateTimeOffset.UtcNow.AddDays(7);
        var dueDateUtc = new DateTimeOffset(
            futureDate.Ticks / 10 * 10,
            TimeSpan.Zero);

        using var response = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/due-date",
            tenantId,
            new SetRequestDueDateRequest(dueDateUtc, created.Version),
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updated = await response.Content
            .ReadFromJsonAsync<RequestMutationResponse>(cancellationToken);

        Assert.NotNull(updated);
        Assert.Equal(dueDateUtc, updated.DueDateUtc);
        Assert.NotEqual(created.Version, updated.Version);

        using var detailsResponse = await GetAsync(
            client,
            $"/api/v1/requests/{created.Id}",
            tenantId,
            cancellationToken);
        var details = await detailsResponse.Content
            .ReadFromJsonAsync<RequestDetailsResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, detailsResponse.StatusCode);
        Assert.NotNull(details);
        Assert.Equal(dueDateUtc, details.DueDateUtc);

        using var staleResponse = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/due-date",
            tenantId,
            new SetRequestDueDateRequest(
                DateTimeOffset.UtcNow.AddDays(10),
                created.Version),
            cancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, staleResponse.StatusCode);
    }

    [Fact]
    public async Task DueDate_ShouldRejectPastDateAndAllowClearing()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);

        using var pastDateResponse = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/due-date",
            tenantId,
            new SetRequestDueDateRequest(
                DateTimeOffset.UtcNow.AddMinutes(-1),
                created.Version),
            cancellationToken);

        Assert.Equal(
            HttpStatusCode.UnprocessableEntity,
            pastDateResponse.StatusCode);

        using var setResponse = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/due-date",
            tenantId,
            new SetRequestDueDateRequest(
                DateTimeOffset.UtcNow.AddDays(2),
                created.Version),
            cancellationToken);
        var withDueDate = await setResponse.Content
            .ReadFromJsonAsync<RequestMutationResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, setResponse.StatusCode);
        Assert.NotNull(withDueDate);

        using var clearResponse = await PatchAsync(
            client,
            $"/api/v1/requests/{created.Id}/due-date",
            tenantId,
            new SetRequestDueDateRequest(null, withDueDate.Version),
            cancellationToken);
        var cleared = await clearResponse.Content
            .ReadFromJsonAsync<RequestMutationResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, clearResponse.StatusCode);
        Assert.NotNull(cleared);
        Assert.Null(cleared.DueDateUtc);
    }

    [Fact]
    public async Task Comments_ShouldPersistPaginateAndIsolateTenant()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);
        var authorUserId = Guid.NewGuid();

        using var firstResponse = await AddCommentAsync(
            client,
            tenantId,
            created.Id,
            authorUserId,
            "  Equipe acionada.  ",
            cancellationToken);
        using var secondResponse = await AddCommentAsync(
            client,
            tenantId,
            created.Id,
            authorUserId,
            "Atendimento agendado.",
            cancellationToken);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Created, secondResponse.StatusCode);

        var firstComment = await firstResponse.Content
            .ReadFromJsonAsync<RequestCommentResponse>(cancellationToken);
        Assert.NotNull(firstComment);
        Assert.Equal("Equipe acionada.", firstComment.Content);

        using var listResponse = await GetAsync(
            client,
            $"/api/v1/requests/{created.Id}/comments?page=1&pageSize=1",
            tenantId,
            cancellationToken);
        var comments = await listResponse.Content
            .ReadFromJsonAsync<PagedRequestCommentsResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        Assert.NotNull(comments);
        Assert.Single(comments.Items);
        Assert.Equal(2, comments.TotalItems);
        Assert.Equal(2, comments.TotalPages);

        using var isolatedListResponse = await GetAsync(
            client,
            $"/api/v1/requests/{created.Id}/comments",
            Guid.NewGuid(),
            cancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, isolatedListResponse.StatusCode);
    }

    [Fact]
    public async Task Comments_ShouldValidateContentAndParentRequest()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var created = await CreateAsync(client, tenantId, cancellationToken);

        using var invalidResponse = await AddCommentAsync(
            client,
            tenantId,
            created.Id,
            Guid.NewGuid(),
            " ",
            cancellationToken);

        Assert.Equal(
            HttpStatusCode.UnprocessableEntity,
            invalidResponse.StatusCode);

        using var missingResponse = await AddCommentAsync(
            client,
            tenantId,
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Comentário válido.",
            cancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, missingResponse.StatusCode);
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
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                "Solicitação com prazo",
                "Descrição da solicitação."));

        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken)
            ?? throw new InvalidOperationException("A API não retornou a solicitação.");
    }

    private static async Task<HttpResponseMessage> AddCommentAsync(
        HttpClient client,
        Guid tenantId,
        Guid requestId,
        Guid authorUserId,
        string content,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/requests/{requestId}/comments");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Content = JsonContent.Create(
            new AddRequestCommentRequest(authorUserId, content));
        return await client.SendAsync(request, cancellationToken);
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
        return await client.SendAsync(request, cancellationToken);
    }
}

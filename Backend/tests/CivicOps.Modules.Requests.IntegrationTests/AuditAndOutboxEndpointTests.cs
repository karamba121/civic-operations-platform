using CivicOps.Modules.Requests.Infrastructure.Persistence;
using CivicOps.Modules.Requests.Presentation.AddRequestComment;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using CivicOps.Modules.Requests.Presentation.ListRequestAudit;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Data;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class AuditAndOutboxEndpointTests
{
    [Fact]
    public async Task Mutations_ShouldPersistAuditAndOutboxAtomically()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var actorUserId = Guid.NewGuid();
        var idempotencyKey = Guid.NewGuid().ToString();

        using var createResponse = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            idempotencyKey,
            cancellationToken);
        var created = await createResponse.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.NotNull(created);

        using var commentResponse = await AddCommentAsync(
            client,
            tenantId,
            actorUserId,
            created.Id,
            cancellationToken);

        Assert.Equal(HttpStatusCode.Created, commentResponse.StatusCode);

        using var auditResponse = await GetAuditAsync(
            client,
            tenantId,
            created.Id,
            cancellationToken);
        var audit = await auditResponse.Content
            .ReadFromJsonAsync<PagedRequestAuditResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.OK, auditResponse.StatusCode);
        Assert.NotNull(audit);
        Assert.Equal(2, audit.TotalItems);
        Assert.All(
            audit.Items,
            record => Assert.Equal(actorUserId, record.ActorUserId));
        Assert.Contains(audit.Items, record => record.Action == "RequestCreated");
        Assert.Contains(audit.Items, record => record.Action == "CommentAdded");

        var outboxCount = await ExecuteScalarAsync(
            factory,
            """
            SELECT COUNT(*)
              FROM requests.outbox_messages
             WHERE tenant_id = @tenant_id
               AND payload ->> 'requestId' = @request_id;
            """,
            tenantId,
            created.Id,
            cancellationToken);
        var matchingEventCount = await ExecuteScalarAsync(
            factory,
            """
            SELECT COUNT(*)
              FROM requests.request_audit audit
              JOIN requests.outbox_messages outbox
                ON outbox.id = audit.event_id
             WHERE audit.tenant_id = @tenant_id
               AND audit.request_id = CAST(@request_id AS uuid)
               AND outbox.processed_at_utc IS NULL
               AND outbox.attempt_count = 0;
            """,
            tenantId,
            created.Id,
            cancellationToken);

        Assert.Equal(2, outboxCount);
        Assert.Equal(2, matchingEventCount);
    }

    [Fact]
    public async Task IdempotentReplayAndFailedCommand_ShouldNotDuplicateHistory()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var actorUserId = Guid.NewGuid();
        var idempotencyKey = Guid.NewGuid().ToString();

        using var firstResponse = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            idempotencyKey,
            cancellationToken);
        var created = await firstResponse.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);
        Assert.NotNull(created);

        using var replayResponse = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            idempotencyKey,
            cancellationToken);
        using var invalidCommentResponse = await AddCommentAsync(
            client,
            tenantId,
            actorUserId,
            created.Id,
            cancellationToken,
            content: " ");

        Assert.Equal(HttpStatusCode.Created, replayResponse.StatusCode);
        Assert.Equal(
            HttpStatusCode.UnprocessableEntity,
            invalidCommentResponse.StatusCode);

        var auditCount = await ExecuteScalarAsync(
            factory,
            """
            SELECT COUNT(*)
              FROM requests.request_audit
             WHERE tenant_id = @tenant_id
               AND request_id = CAST(@request_id AS uuid);
            """,
            tenantId,
            created.Id,
            cancellationToken);
        var outboxCount = await ExecuteScalarAsync(
            factory,
            """
            SELECT COUNT(*)
              FROM requests.outbox_messages
             WHERE tenant_id = @tenant_id
               AND payload ->> 'requestId' = @request_id;
            """,
            tenantId,
            created.Id,
            cancellationToken);

        Assert.Equal(1, auditCount);
        Assert.Equal(1, outboxCount);
    }

    [Fact]
    public async Task Audit_ShouldEnforceTenantAndUserHeader()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var actorUserId = Guid.NewGuid();

        using var missingUserRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        missingUserRequest.Headers.Add("X-Tenant-Id", tenantId.ToString());
        missingUserRequest.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        missingUserRequest.Content = JsonContent.Create(
            new CreateRequestRequest("Título", "Descrição"));
        using var missingUserResponse = await client.SendAsync(
            missingUserRequest,
            cancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, missingUserResponse.StatusCode);

        using var createResponse = await CreateAsync(
            client,
            tenantId,
            actorUserId,
            Guid.NewGuid().ToString(),
            cancellationToken);
        var created = await createResponse.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);
        Assert.NotNull(created);

        using var isolatedResponse = await GetAuditAsync(
            client,
            Guid.NewGuid(),
            created.Id,
            cancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, isolatedResponse.StatusCode);
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

    private static async Task<HttpResponseMessage> CreateAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", actorUserId.ToString());
        request.Headers.Add("Idempotency-Key", idempotencyKey);
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                "Solicitação auditada",
                "Descrição da solicitação."));
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<HttpResponseMessage> AddCommentAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        Guid requestId,
        CancellationToken cancellationToken,
        string content = "Atendimento iniciado.")
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/requests/{requestId}/comments");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", actorUserId.ToString());
        request.Content = JsonContent.Create(new AddRequestCommentRequest(content));
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<HttpResponseMessage> GetAuditAsync(
        HttpClient client,
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            $"/api/v1/requests/{requestId}/audit");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<long> ExecuteScalarAsync(
        WebApplicationFactory<Program> factory,
        string sql,
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
        command.CommandText = sql;

        var tenantParameter = command.CreateParameter();
        tenantParameter.ParameterName = "tenant_id";
        tenantParameter.Value = tenantId;
        command.Parameters.Add(tenantParameter);

        var requestParameter = command.CreateParameter();
        requestParameter.ParameterName = "request_id";
        requestParameter.Value = requestId.ToString();
        command.Parameters.Add(requestParameter);

        return Convert.ToInt64(
            await command.ExecuteScalarAsync(cancellationToken));
    }
}

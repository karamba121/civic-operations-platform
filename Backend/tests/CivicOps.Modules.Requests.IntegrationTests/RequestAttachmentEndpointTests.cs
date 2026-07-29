using CivicOps.Modules.Requests.Infrastructure.Persistence;
using CivicOps.Modules.Requests.Presentation.Attachments;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Data;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class RequestAttachmentEndpointTests
{
    [Fact]
    public async Task Upload_ShouldStoreMetadataAndKeepContentOutsideDatabase()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var storageRoot = CreateStorageRoot();
        var factory = CreateFactory(storageRoot);

        try
        {
            using var client = factory.CreateClient();
            var tenantId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var request = await CreateRequestAsync(
                client,
                tenantId,
                userId,
                cancellationToken);
            var content = "attachment evidence"u8.ToArray();

            using var uploadResponse = await UploadAsync(
                client,
                tenantId,
                userId,
                request.Id,
                @"..\evidence.txt",
                "text/plain",
                content,
                cancellationToken);

            Assert.Equal(
                HttpStatusCode.Created,
                uploadResponse.StatusCode);
            var attachment = await uploadResponse.Content
                .ReadFromJsonAsync<RequestAttachmentResponse>(
                    cancellationToken);
            Assert.NotNull(attachment);
            Assert.Equal("evidence.txt", attachment.FileName);
            Assert.Equal("text/plain", attachment.ContentType);
            Assert.Equal(content.LongLength, attachment.SizeBytes);
            Assert.Equal(
                Convert.ToHexString(SHA256.HashData(content))
                    .ToLowerInvariant(),
                attachment.Sha256);

            await using var scope = factory.Services.CreateAsyncScope();
            var dbContext = scope.ServiceProvider
                .GetRequiredService<RequestsDbContext>();
            var metadata = await dbContext.RequestAttachments
                .AsNoTracking()
                .SingleAsync(
                    item =>
                        item.TenantId == tenantId &&
                        item.Id == attachment.Id,
                    cancellationToken);

            Assert.DoesNotContain(
                metadata.FileName,
                metadata.StorageKey,
                StringComparison.OrdinalIgnoreCase);
            var storedPath = Path.Combine(
                storageRoot,
                metadata.StorageKey.Replace(
                    '/',
                    Path.DirectorySeparatorChar));
            Assert.True(File.Exists(storedPath));
            Assert.Equal(
                content,
                await File.ReadAllBytesAsync(
                    storedPath,
                    cancellationToken));
            Assert.Equal(
                1,
                await CountRecordsAsync(
                    dbContext,
                    """
                    SELECT COUNT(*)
                    FROM requests.request_audit
                    WHERE tenant_id = @tenant_id
                      AND request_id = @request_id
                      AND action = 'AttachmentAdded';
                    """,
                    tenantId,
                    request.Id,
                    cancellationToken));
            Assert.Equal(
                1,
                await CountRecordsAsync(
                    dbContext,
                    """
                    SELECT COUNT(*)
                    FROM requests.outbox_messages
                    WHERE tenant_id = @tenant_id
                      AND type = 'requests.attachment-added.v1'
                      AND payload ->> 'requestId' = @request_id_text;
                    """,
                    tenantId,
                    request.Id,
                    cancellationToken));

            using var listResponse = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments",
                tenantId,
                cancellationToken);
            listResponse.EnsureSuccessStatusCode();
            var listed = await listResponse.Content
                .ReadFromJsonAsync<List<RequestAttachmentResponse>>(
                    cancellationToken);
            Assert.NotNull(listed);
            Assert.Equal(attachment.Id, Assert.Single(listed).Id);

            using var downloadResponse = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments/" +
                $"{attachment.Id}/content",
                tenantId,
                cancellationToken);
            downloadResponse.EnsureSuccessStatusCode();
            Assert.Equal(
                content,
                await downloadResponse.Content
                    .ReadAsByteArrayAsync(cancellationToken));
            Assert.Equal(
                "text/plain",
                downloadResponse.Content.Headers.ContentType?.MediaType);

            using var isolatedList = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments",
                Guid.NewGuid(),
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.NotFound,
                isolatedList.StatusCode);
        }
        finally
        {
            await factory.DisposeAsync();
            DeleteStorageRoot(storageRoot);
        }
    }

    private static WebApplicationFactory<Program> CreateFactory(
        string storageRoot)
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
                                ["NotificationsConsumer:Enabled"] = "false",
                                ["AttachmentStorage:RootPath"] = storageRoot,
                                ["AttachmentStorage:MaximumSizeBytes"] =
                                    "1048576"
                            });
                    });
            });
    }

    private static async Task<CreateRequestResponse> CreateRequestAsync(
        HttpClient client,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", userId.ToString());
        request.Headers.Add(
            "Idempotency-Key",
            Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                "Solicitação com anexo",
                "Validação do armazenamento externo."));
        using var response = await client.SendAsync(
            request,
            cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(
                cancellationToken)
            ?? throw new InvalidOperationException(
                "A solicitação não foi retornada.");
    }

    private static async Task<HttpResponseMessage> UploadAsync(
        HttpClient client,
        Guid tenantId,
        Guid userId,
        Guid requestId,
        string fileName,
        string contentType,
        byte[] content,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/api/v1/requests/{requestId}/attachments");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", userId.ToString());
        var form = new MultipartFormDataContent();
        var file = new ByteArrayContent(content);
        file.Headers.ContentType =
            MediaTypeHeaderValue.Parse(contentType);
        form.Add(file, "file", fileName);
        request.Content = form;
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<HttpResponseMessage> SendForTenantAsync(
        HttpClient client,
        HttpMethod method,
        string path,
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(method, path);
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<long> CountRecordsAsync(
        RequestsDbContext dbContext,
        string sql,
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        AddParameter(command, "tenant_id", tenantId);
        AddParameter(command, "request_id", requestId);
        AddParameter(
            command,
            "request_id_text",
            requestId.ToString());
        return Convert.ToInt64(
            await command.ExecuteScalarAsync(cancellationToken));
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

    private static string CreateStorageRoot()
    {
        return Path.GetFullPath(
            Path.Combine(
                AppContext.BaseDirectory,
                "attachment-storage-tests",
                Guid.NewGuid().ToString("N")));
    }

    private static void DeleteStorageRoot(string storageRoot)
    {
        var resolvedRoot = Path.GetFullPath(storageRoot);
        var allowedRoot = Path.GetFullPath(
            Path.Combine(
                AppContext.BaseDirectory,
                "attachment-storage-tests"));
        var allowedPrefix = allowedRoot.EndsWith(
            Path.DirectorySeparatorChar)
            ? allowedRoot
            : $"{allowedRoot}{Path.DirectorySeparatorChar}";

        if (!resolvedRoot.StartsWith(
                allowedPrefix,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "O diretório de teste está fora da raiz permitida.");
        }

        if (Directory.Exists(resolvedRoot))
        {
            Directory.Delete(resolvedRoot, recursive: true);
        }
    }
}

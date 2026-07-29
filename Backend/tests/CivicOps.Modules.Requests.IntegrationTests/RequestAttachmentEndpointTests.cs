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
            var content = "%PDF-1.7\nattachment evidence"u8.ToArray();

            using var uploadResponse = await UploadAsync(
                client,
                tenantId,
                userId,
                request.Id,
                @"..\evidence.pdf",
                "application/pdf",
                content,
                cancellationToken);

            Assert.Equal(
                HttpStatusCode.Created,
                uploadResponse.StatusCode);
            var attachment = await uploadResponse.Content
                .ReadFromJsonAsync<RequestAttachmentResponse>(
                    cancellationToken);
            Assert.NotNull(attachment);
            Assert.Equal("evidence.pdf", attachment.FileName);
            Assert.Equal("application/pdf", attachment.ContentType);
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
                userId,
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
                userId,
                cancellationToken);
            downloadResponse.EnsureSuccessStatusCode();
            Assert.Equal(
                content,
                await downloadResponse.Content
                    .ReadAsByteArrayAsync(cancellationToken));
            Assert.Equal(
                "application/pdf",
                downloadResponse.Content.Headers.ContentType?.MediaType);

            using var isolatedList = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments",
                Guid.NewGuid(),
                userId,
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.NotFound,
                isolatedList.StatusCode);

            using var forbiddenList = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments",
                tenantId,
                Guid.NewGuid(),
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.Forbidden,
                forbiddenList.StatusCode);

            using var forbiddenDownload = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments/" +
                $"{attachment.Id}/content",
                tenantId,
                Guid.NewGuid(),
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.Forbidden,
                forbiddenDownload.StatusCode);
        }
        finally
        {
            await factory.DisposeAsync();
            DeleteStorageRoot(storageRoot);
        }
    }

    [Fact]
    public async Task Upload_ShouldRejectUnauthorizedUnsupportedSpoofedAndOversizedFiles()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var storageRoot = CreateStorageRoot();
        var factory = CreateFactory(storageRoot, maximumSizeBytes: 16);

        try
        {
            using var client = factory.CreateClient();
            var tenantId = Guid.NewGuid();
            var creatorUserId = Guid.NewGuid();
            var request = await CreateRequestAsync(
                client,
                tenantId,
                creatorUserId,
                cancellationToken);

            using var unauthorized = await UploadAsync(
                client,
                tenantId,
                Guid.NewGuid(),
                request.Id,
                "evidence.pdf",
                "application/pdf",
                "%PDF-1.7"u8.ToArray(),
                cancellationToken);
            Assert.Equal(HttpStatusCode.Forbidden, unauthorized.StatusCode);

            using var unsupported = await UploadAsync(
                client,
                tenantId,
                creatorUserId,
                request.Id,
                "evidence.exe",
                "application/pdf",
                "%PDF-1.7"u8.ToArray(),
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.UnsupportedMediaType,
                unsupported.StatusCode);

            using var spoofed = await UploadAsync(
                client,
                tenantId,
                creatorUserId,
                request.Id,
                "evidence.pdf",
                "application/pdf",
                "not a pdf"u8.ToArray(),
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.UnsupportedMediaType,
                spoofed.StatusCode);

            using var oversized = await UploadAsync(
                client,
                tenantId,
                creatorUserId,
                request.Id,
                "evidence.pdf",
                "application/pdf",
                "%PDF-1.7 content larger than limit"u8.ToArray(),
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.RequestEntityTooLarge,
                oversized.StatusCode);

            Assert.Empty(
                Directory.Exists(storageRoot)
                    ? Directory.EnumerateFiles(
                        storageRoot,
                        "*",
                        SearchOption.AllDirectories)
                    : Array.Empty<string>());
        }
        finally
        {
            await factory.DisposeAsync();
            DeleteStorageRoot(storageRoot);
        }
    }

    [Fact]
    public async Task TenantRoles_ShouldGrantPermissionsAndRemainTenantScoped()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var storageRoot = CreateStorageRoot();
        var factory = CreateFactory(storageRoot);

        try
        {
            using var client = factory.CreateClient();
            var tenantId = Guid.NewGuid();
            var requestCreatorId = Guid.NewGuid();
            var administratorId = Guid.NewGuid();
            var readerId = Guid.NewGuid();
            var operatorId = Guid.NewGuid();
            var request = await CreateRequestAsync(
                client,
                tenantId,
                requestCreatorId,
                cancellationToken);

            using var creatorUpload = await UploadAsync(
                client,
                tenantId,
                requestCreatorId,
                request.Id,
                "creator.pdf",
                "application/pdf",
                "%PDF-1.7 creator"u8.ToArray(),
                cancellationToken);
            Assert.Equal(HttpStatusCode.Created, creatorUpload.StatusCode);

            using var bootstrap = await SendAccessAsync(
                client,
                HttpMethod.Post,
                "/api/v1/access/bootstrap",
                tenantId,
                administratorId,
                content: null,
                cancellationToken);
            Assert.Equal(HttpStatusCode.Created, bootstrap.StatusCode);

            using var duplicateBootstrap = await SendAccessAsync(
                client,
                HttpMethod.Post,
                "/api/v1/access/bootstrap",
                tenantId,
                Guid.NewGuid(),
                content: null,
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.Conflict,
                duplicateBootstrap.StatusCode);

            using var grantReader = await SetRoleAsync(
                client,
                tenantId,
                administratorId,
                readerId,
                "Reader",
                cancellationToken);
            grantReader.EnsureSuccessStatusCode();

            using var grantOperator = await SetRoleAsync(
                client,
                tenantId,
                administratorId,
                operatorId,
                "Operator",
                cancellationToken);
            grantOperator.EnsureSuccessStatusCode();

            using var removeLastAdministrator = await SetRoleAsync(
                client,
                tenantId,
                administratorId,
                administratorId,
                "Reader",
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.UnprocessableEntity,
                removeLastAdministrator.StatusCode);

            using var readerList = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments",
                tenantId,
                readerId,
                cancellationToken);
            readerList.EnsureSuccessStatusCode();

            using var readerUpload = await UploadAsync(
                client,
                tenantId,
                readerId,
                request.Id,
                "reader.pdf",
                "application/pdf",
                "%PDF-1.7 reader"u8.ToArray(),
                cancellationToken);
            Assert.Equal(HttpStatusCode.Forbidden, readerUpload.StatusCode);

            using var operatorUpload = await UploadAsync(
                client,
                tenantId,
                operatorId,
                request.Id,
                "operator.pdf",
                "application/pdf",
                "%PDF-1.7 operator"u8.ToArray(),
                cancellationToken);
            Assert.Equal(HttpStatusCode.Created, operatorUpload.StatusCode);

            using var forbiddenGrant = await SetRoleAsync(
                client,
                tenantId,
                readerId,
                Guid.NewGuid(),
                "Reader",
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.Forbidden,
                forbiddenGrant.StatusCode);

            using var memberList = await SendAccessAsync(
                client,
                HttpMethod.Get,
                "/api/v1/access/members",
                tenantId,
                administratorId,
                content: null,
                cancellationToken);
            memberList.EnsureSuccessStatusCode();
            var memberships = await memberList.Content
                .ReadFromJsonAsync<List<System.Text.Json.JsonElement>>(
                    cancellationToken);
            Assert.NotNull(memberships);
            Assert.Equal(3, memberships.Count);

            using var otherTenantAccess = await SendForTenantAsync(
                client,
                HttpMethod.Get,
                $"/api/v1/requests/{request.Id}/attachments",
                Guid.NewGuid(),
                readerId,
                cancellationToken);
            Assert.Equal(
                HttpStatusCode.NotFound,
                otherTenantAccess.StatusCode);

            var concurrentTenantId = Guid.NewGuid();
            var concurrentBootstraps = await Task.WhenAll(
                SendAccessAsync(
                    client,
                    HttpMethod.Post,
                    "/api/v1/access/bootstrap",
                    concurrentTenantId,
                    Guid.NewGuid(),
                    content: null,
                    cancellationToken),
                SendAccessAsync(
                    client,
                    HttpMethod.Post,
                    "/api/v1/access/bootstrap",
                    concurrentTenantId,
                    Guid.NewGuid(),
                    content: null,
                    cancellationToken));
            try
            {
                Assert.Equal(
                    [
                        HttpStatusCode.Created,
                        HttpStatusCode.Conflict
                    ],
                    concurrentBootstraps
                        .Select(response => response.StatusCode)
                        .Order()
                        .ToArray());
            }
            finally
            {
                foreach (var response in concurrentBootstraps)
                {
                    response.Dispose();
                }
            }
        }
        finally
        {
            await factory.DisposeAsync();
            DeleteStorageRoot(storageRoot);
        }
    }

    [Fact]
    public async Task Bootstrap_ShouldRequireExplicitConfiguration()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var storageRoot = CreateStorageRoot();
        var factory = CreateFactory(
            storageRoot,
            bootstrapEnabled: false);

        try
        {
            using var client = factory.CreateClient();
            using var response = await SendAccessAsync(
                client,
                HttpMethod.Post,
                "/api/v1/access/bootstrap",
                Guid.NewGuid(),
                Guid.NewGuid(),
                content: null,
                cancellationToken);

            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
        finally
        {
            await factory.DisposeAsync();
            DeleteStorageRoot(storageRoot);
        }
    }

    private static WebApplicationFactory<Program> CreateFactory(
        string storageRoot,
        long maximumSizeBytes = 1_048_576,
        bool bootstrapEnabled = true)
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
                                ["NotificationsConsumer:Enabled"] =
                                "false",
                                ["IdentityAccess:BootstrapEnabled"] =
                                bootstrapEnabled.ToString(
                                    System.Globalization.CultureInfo.InvariantCulture),
                                ["AttachmentStorage:RootPath"] =
                                storageRoot,
                                ["AttachmentStorage:MaximumSizeBytes"] =
                                maximumSizeBytes.ToString(
                                    System.Globalization.CultureInfo.InvariantCulture)
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
        Guid userId,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(method, path);
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", userId.ToString());
        return await client.SendAsync(request, cancellationToken);
    }

    private static Task<HttpResponseMessage> SetRoleAsync(
        HttpClient client,
        Guid tenantId,
        Guid actorUserId,
        Guid targetUserId,
        string role,
        CancellationToken cancellationToken)
    {
        return SendAccessAsync(
            client,
            HttpMethod.Put,
            $"/api/v1/access/members/{targetUserId}",
            tenantId,
            actorUserId,
            JsonContent.Create(new { role }),
            cancellationToken);
    }

    private static async Task<HttpResponseMessage> SendAccessAsync(
        HttpClient client,
        HttpMethod method,
        string path,
        Guid tenantId,
        Guid actorUserId,
        HttpContent? content,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(method, path);
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", actorUserId.ToString());
        request.Content = content;
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

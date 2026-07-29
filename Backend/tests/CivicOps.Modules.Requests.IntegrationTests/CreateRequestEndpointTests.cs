using CivicOps.Modules.Requests.Presentation.CreateRequest;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class CreateRequestEndpointTests
{
    [Fact]
    public async Task Create_ShouldGenerateIndependentAtomicSequencesPerTenant()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;

        var concurrentTenantId = Guid.NewGuid();
        var requests = Enumerable
            .Range(1, 12)
            .Select(index => CreateAsync(
                client,
                concurrentTenantId,
                $"Solicitação concorrente {index}",
                cancellationToken))
            .ToArray();

        var responses = await Task.WhenAll(requests);
        var currentYear = DateTimeOffset.UtcNow.Year;

        Assert.All(
            responses,
            response => Assert.Equal(HttpStatusCode.Created, response.StatusCode));

        var protocolNumbers = await ReadProtocolNumbersAsync(
            responses,
            cancellationToken);
        var expected = Enumerable
            .Range(1, 12)
            .Select(sequence => $"{currentYear:D4}-{sequence:D6}")
            .ToArray();

        Assert.Equal(expected, protocolNumbers);

        var otherTenantResponse = await CreateAsync(
            client,
            Guid.NewGuid(),
            "Solicitação de outro tenant",
            cancellationToken);

        Assert.Equal(HttpStatusCode.Created, otherTenantResponse.StatusCode);

        var otherTenantBody =
            await otherTenantResponse.Content.ReadFromJsonAsync<CreateRequestResponse>(
                cancellationToken);

        Assert.NotNull(otherTenantBody);
        Assert.Equal($"{currentYear:D4}-000001", otherTenantBody.ProtocolNumber);
    }

    [Fact]
    public async Task Create_ShouldRejectMissingTenantHeader()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;

        var response = await client.PostAsJsonAsync(
            "/api/v1/requests",
            new CreateRequestRequest("Título", "Descrição"),
            cancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_ShouldReturnSameRequestForRepeatedIdempotencyKey()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var idempotencyKey = Guid.NewGuid().ToString();

        using var firstResponse = await CreateAsync(
            client,
            tenantId,
            "Solicitação idempotente",
            cancellationToken,
            idempotencyKey);

        using var repeatedResponse = await CreateAsync(
            client,
            tenantId,
            "Solicitação idempotente",
            cancellationToken,
            idempotencyKey);

        var firstBody = await firstResponse.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);
        var repeatedBody = await repeatedResponse.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Created, repeatedResponse.StatusCode);
        Assert.NotNull(firstBody);
        Assert.NotNull(repeatedBody);
        Assert.Equal(firstBody.Id, repeatedBody.Id);
        Assert.Equal(firstBody.ProtocolNumber, repeatedBody.ProtocolNumber);

        using var conflictResponse = await CreateAsync(
            client,
            tenantId,
            "Conteúdo diferente",
            cancellationToken,
            idempotencyKey);

        Assert.Equal(HttpStatusCode.Conflict, conflictResponse.StatusCode);
    }

    [Fact]
    public async Task Create_ShouldCoalesceConcurrentRetriesWithSameIdempotencyKey()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var idempotencyKey = Guid.NewGuid().ToString();

        var requests = Enumerable
            .Range(1, 8)
            .Select(_ => CreateAsync(
                client,
                tenantId,
                "Mesmo conteúdo",
                cancellationToken,
                idempotencyKey))
            .ToArray();

        var responses = await Task.WhenAll(requests);
        var bodies = new List<CreateRequestResponse>();

        foreach (var response in responses)
        {
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            var body = await response.Content
                .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken);
            Assert.NotNull(body);
            bodies.Add(body);
            response.Dispose();
        }

        Assert.Single(bodies.Select(body => body.Id).Distinct());
        Assert.Single(bodies.Select(body => body.ProtocolNumber).Distinct());
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
        string title,
        CancellationToken cancellationToken,
        string? idempotencyKey = null)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");

        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", Guid.NewGuid().ToString());
        request.Headers.Add(
            "Idempotency-Key",
            idempotencyKey ?? Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(
                title,
                "Teste de geração atômica de protocolo."));

        return await client.SendAsync(request, cancellationToken);
    }

    private static async Task<string[]> ReadProtocolNumbersAsync(
        IEnumerable<HttpResponseMessage> responses,
        CancellationToken cancellationToken)
    {
        var protocolNumbers = new List<string>();

        foreach (var response in responses)
        {
            var body = await response.Content.ReadFromJsonAsync<CreateRequestResponse>(
                cancellationToken);
            Assert.NotNull(body);
            protocolNumbers.Add(body.ProtocolNumber);
            response.Dispose();
        }

        protocolNumbers.Sort(StringComparer.Ordinal);
        return [.. protocolNumbers];
    }
}

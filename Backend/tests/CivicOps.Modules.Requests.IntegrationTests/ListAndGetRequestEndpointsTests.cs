using CivicOps.Modules.Requests.Presentation.CreateRequest;
using CivicOps.Modules.Requests.Presentation.GetRequestDetails;
using CivicOps.Modules.Requests.Presentation.ListRequests;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class ListAndGetRequestEndpointsTests
{
    [Fact]
    public async Task List_ShouldPaginateFilterAndIsolateTenant()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var otherTenantId = Guid.NewGuid();

        var created = new[]
        {
            await CreateAsync(client, tenantId, "Iluminação Alfa", "Poste apagado", cancellationToken),
            await CreateAsync(client, tenantId, "Poda de árvore", "Árvore sobre a via", cancellationToken),
            await CreateAsync(client, tenantId, "Iluminação Beta", "Lâmpada oscilando", cancellationToken),
            await CreateAsync(client, tenantId, "Reparo de calçada", "Calçada danificada", cancellationToken),
            await CreateAsync(client, tenantId, "Coleta urbana", "Resíduo não coletado", cancellationToken)
        };

        await CreateAsync(
            client,
            otherTenantId,
            "Solicitação isolada",
            "Pertence a outro tenant",
            cancellationToken);

        var firstPage = await ListAsync(
            client,
            tenantId,
            "?page=1&pageSize=2",
            cancellationToken);
        var secondPage = await ListAsync(
            client,
            tenantId,
            "?page=2&pageSize=2",
            cancellationToken);

        Assert.Equal(5, firstPage.TotalItems);
        Assert.Equal(3, firstPage.TotalPages);
        Assert.Equal(2, firstPage.Items.Count);
        Assert.Equal(2, secondPage.Items.Count);
        Assert.Empty(firstPage.Items.Select(item => item.Id)
            .Intersect(secondPage.Items.Select(item => item.Id)));

        var titleSearch = await ListAsync(
            client,
            tenantId,
            "?search=ilumina%C3%A7%C3%A3o",
            cancellationToken);

        Assert.Equal(2, titleSearch.TotalItems);
        Assert.All(
            titleSearch.Items,
            item => Assert.Contains(
                "Iluminação",
                item.Title,
                StringComparison.OrdinalIgnoreCase));

        var protocolSearch = await ListAsync(
            client,
            tenantId,
            $"?search={created[0].ProtocolNumber}",
            cancellationToken);

        Assert.Equal(1, protocolSearch.TotalItems);
        Assert.Equal(created[0].Id, Assert.Single(protocolSearch.Items).Id);

        var submitted = await ListAsync(
            client,
            tenantId,
            "?status=Submitted",
            cancellationToken);
        var inProgress = await ListAsync(
            client,
            tenantId,
            "?status=InProgress",
            cancellationToken);

        Assert.Equal(5, submitted.TotalItems);
        Assert.Equal(0, inProgress.TotalItems);

        var future = Uri.EscapeDataString(
            DateTimeOffset.UtcNow.AddDays(1).ToString("O", CultureInfo.InvariantCulture));
        var futureResult = await ListAsync(
            client,
            tenantId,
            $"?createdFromUtc={future}",
            cancellationToken);

        Assert.Equal(0, futureResult.TotalItems);

        var isolated = await ListAsync(
            client,
            otherTenantId,
            string.Empty,
            cancellationToken);

        Assert.Equal(1, isolated.TotalItems);
        Assert.DoesNotContain(
            isolated.Items,
            item => created.Any(request => request.Id == item.Id));
    }

    [Fact]
    public async Task Details_ShouldReturnRequestOnlyInsideCurrentTenant()
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var tenantId = Guid.NewGuid();
        var otherTenantId = Guid.NewGuid();

        var created = await CreateAsync(
            client,
            tenantId,
            "Detalhe da solicitação",
            "Descrição completa para consulta.",
            cancellationToken);

        using var response = await SendGetAsync(
            client,
            $"/api/v1/requests/{created.Id}",
            tenantId,
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var details = await response.Content
            .ReadFromJsonAsync<RequestDetailsResponse>(cancellationToken);

        Assert.NotNull(details);
        Assert.Equal(created.Id, details.Id);
        Assert.Equal(created.ProtocolNumber, details.ProtocolNumber);
        Assert.Equal("Detalhe da solicitação", details.Title);
        Assert.Equal("Descrição completa para consulta.", details.Description);
        Assert.Equal("Submitted", details.Status);

        using var isolatedResponse = await SendGetAsync(
            client,
            $"/api/v1/requests/{created.Id}",
            otherTenantId,
            cancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, isolatedResponse.StatusCode);
    }

    [Theory]
    [InlineData("?page=0")]
    [InlineData("?pageSize=101")]
    [InlineData("?status=Unknown")]
    [InlineData("?createdFromUtc=2026-07-30T00%3A00%3A00Z&createdToUtc=2026-07-29T00%3A00%3A00Z")]
    public async Task List_ShouldRejectInvalidParameters(string queryString)
    {
        await using var factory = CreateFactory();
        using var client = factory.CreateClient();

        using var response = await SendGetAsync(
            client,
            $"/api/v1/requests{queryString}",
            Guid.NewGuid(),
            TestContext.Current.CancellationToken);

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
        string title,
        string description,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/requests");
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", Guid.NewGuid().ToString());
        request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());
        request.Content = JsonContent.Create(
            new CreateRequestRequest(title, description));

        using var response = await client.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content
            .ReadFromJsonAsync<CreateRequestResponse>(cancellationToken)
            ?? throw new InvalidOperationException("A API não retornou a solicitação.");
    }

    private static async Task<PagedRequestsResponse> ListAsync(
        HttpClient client,
        Guid tenantId,
        string queryString,
        CancellationToken cancellationToken)
    {
        using var response = await SendGetAsync(
            client,
            $"/api/v1/requests{queryString}",
            tenantId,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException(
                $"A listagem retornou {(int)response.StatusCode}: {error}");
        }

        return await response.Content
            .ReadFromJsonAsync<PagedRequestsResponse>(cancellationToken)
            ?? throw new InvalidOperationException("A API não retornou a página.");
    }

    private static async Task<HttpResponseMessage> SendGetAsync(
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

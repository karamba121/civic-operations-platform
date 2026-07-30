using CivicOps.Modules.IdentityAccess;
using CivicOps.Modules.IdentityAccess.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace CivicOps.Modules.Requests.IntegrationTests;

public sealed class PlatformAdministrationEndpointTests
{
    private static readonly Guid PlatformAdministratorId =
        Guid.Parse("33333333-3333-3333-3333-333333333333");

    [Fact]
    public async Task PlatformAdministrator_ShouldCreateTenantAndTenantUser()
    {
        var tenantAdministratorId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var identityProvider = new FakeManagedIdentityProvider(
            tenantAdministratorId,
            tenantUserId);
        await using var factory = CreateFactory(identityProvider);
        using var client = factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var suffix = Guid.NewGuid().ToString("N")[..10];

        using var createTenant = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/platform/tenants");
        AddPlatformAdministratorHeaders(createTenant);
        createTenant.Content = JsonContent.Create(new
        {
            name = $"Prefeitura {suffix}",
            slug = $"prefeitura-{suffix}",
            administratorUsername = $"tenant-admin-{suffix}",
            administratorDisplayName = "Administrador do Tenant",
            administratorEmail = $"tenant-admin-{suffix}@civicops.local",
            administratorPassword = "tenant_dev_123"
        });

        using var tenantResponse = await client.SendAsync(
            createTenant,
            cancellationToken);
        var tenant = await tenantResponse.Content
            .ReadFromJsonAsync<TenantResponse>(cancellationToken);

        Assert.Equal(HttpStatusCode.Created, tenantResponse.StatusCode);
        Assert.NotNull(tenant);
        Assert.Single(identityProvider.Requests);
        Assert.Equal(
            tenant.Id,
            identityProvider.Requests[0].TenantId);
        Assert.False(
            identityProvider.Requests[0].IsPlatformAdministrator);

        using var createUser = new HttpRequestMessage(
            HttpMethod.Post,
            "/api/v1/access/users");
        AddTenantHeaders(
            createUser,
            tenant.Id,
            tenantAdministratorId);
        createUser.Content = JsonContent.Create(new
        {
            username = $"operator-{suffix}",
            displayName = "Operador do Tenant",
            email = $"operator-{suffix}@civicops.local",
            password = "operator_dev_123",
            role = "Operator"
        });

        using var userResponse = await client.SendAsync(
            createUser,
            cancellationToken);
        var user = await userResponse.Content
            .ReadFromJsonAsync<ManagedUserResponse>(
                cancellationToken);

        Assert.Equal(HttpStatusCode.Created, userResponse.StatusCode);
        Assert.NotNull(user);
        Assert.Equal("Operator", user.Role);
        Assert.Equal(tenant.Id, user.TenantId);
        Assert.Equal(2, identityProvider.Requests.Count);

        await using var scope = factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider
            .GetRequiredService<IdentityAccessDbContext>();
        Assert.True(await dbContext.Tenants.AnyAsync(
            item => item.Id == tenant.Id,
            cancellationToken));
        Assert.True(await dbContext.ManagedUsers.AnyAsync(
            item =>
                item.Id == tenantAdministratorId &&
                item.TenantId == tenant.Id,
            cancellationToken));
        Assert.True(await dbContext.ManagedUsers.AnyAsync(
            item =>
                item.Id == tenantUserId &&
                item.TenantId == tenant.Id,
            cancellationToken));
        Assert.True(await dbContext.TenantMemberships.AnyAsync(
            membership =>
                membership.TenantId == tenant.Id &&
                membership.UserId == tenantAdministratorId &&
                membership.Role == TenantRole.Administrator,
            cancellationToken));
        Assert.True(await dbContext.TenantMemberships.AnyAsync(
            membership =>
                membership.TenantId == tenant.Id &&
                membership.UserId == tenantUserId &&
                membership.Role == TenantRole.Operator,
            cancellationToken));
    }

    [Fact]
    public async Task TenantAdministrator_ShouldNotAccessPlatformEndpoints()
    {
        await using var factory = CreateFactory(
            new FakeManagedIdentityProvider());
        using var client = factory.CreateClient();
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "/api/v1/platform/tenants");
        AddTenantHeaders(
            request,
            Guid.NewGuid(),
            Guid.NewGuid());

        using var response = await client.SendAsync(
            request,
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private static WebApplicationFactory<Program> CreateFactory(
        IManagedIdentityProvider identityProvider)
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
                                ["Authentication:Enabled"] = "false",
                                ["OutboxMetrics:Enabled"] = "false",
                                ["OutboxRetention:Enabled"] = "false",
                                ["KeycloakAdministration:Enabled"] =
                                    "false"
                            });
                    });
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll<IManagedIdentityProvider>();
                    services.AddSingleton(identityProvider);
                });
            });
    }

    private static void AddPlatformAdministratorHeaders(
        HttpRequestMessage request)
    {
        request.Headers.Add(
            "X-User-Id",
            PlatformAdministratorId.ToString());
        request.Headers.Add(
            "X-Platform-Administrator",
            "true");
    }

    private static void AddTenantHeaders(
        HttpRequestMessage request,
        Guid tenantId,
        Guid userId)
    {
        request.Headers.Add("X-Tenant-Id", tenantId.ToString());
        request.Headers.Add("X-User-Id", userId.ToString());
    }

    private sealed class FakeManagedIdentityProvider(
        params Guid[] userIds) : IManagedIdentityProvider
    {
        private readonly Queue<Guid> _userIds = new(userIds);

        public List<ProvisionIdentityRequest> Requests { get; } = [];

        public Task<ProvisionedIdentity> CreateAsync(
            ProvisionIdentityRequest request,
            CancellationToken cancellationToken)
        {
            Requests.Add(request);
            return Task.FromResult(new ProvisionedIdentity(
                _userIds.Count > 0
                    ? _userIds.Dequeue()
                    : Guid.NewGuid()));
        }

        public Task DeleteAsync(
            Guid userId,
            CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }

    private sealed record TenantResponse(
        Guid Id,
        string Name,
        string Slug,
        bool IsActive,
        DateTimeOffset CreatedAtUtc);

    private sealed record ManagedUserResponse(
        Guid Id,
        string Username,
        string DisplayName,
        string Email,
        Guid? TenantId,
        bool IsPlatformAdministrator,
        string? Role,
        bool IsActive,
        DateTimeOffset CreatedAtUtc);
}

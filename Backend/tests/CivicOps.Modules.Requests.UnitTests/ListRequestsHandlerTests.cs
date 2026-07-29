using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.GetRequestDashboard;
using CivicOps.Modules.Requests.Application.ListRequestComments;
using CivicOps.Modules.Requests.Application.ListRequestAudit;
using CivicOps.Modules.Requests.Application.ListRequests;
using Xunit;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class ListRequestsHandlerTests
{
    private static readonly Guid TenantId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 0)]
    [InlineData(1, 101)]
    [InlineData(1_000_001, 20)]
    public async Task Handle_ShouldRejectInvalidPagination(int page, int pageSize)
    {
        var handler = new ListRequestsHandler(new RequestReadServiceStub());

        var action = () => handler.HandleAsync(
            new ListRequestsQuery(
                TenantId,
                page,
                pageSize,
                null,
                null,
                null,
                null),
            TestContext.Current.CancellationToken);

        await Assert.ThrowsAsync<RequestQueryValidationException>(action);
    }

    [Fact]
    public async Task Handle_ShouldNormalizeSearchAndDates()
    {
        var readService = new RequestReadServiceStub();
        var handler = new ListRequestsHandler(readService);
        var localOffset = TimeSpan.FromHours(-3);
        var createdFrom = new DateTimeOffset(2026, 7, 1, 8, 0, 0, localOffset);

        await handler.HandleAsync(
            new ListRequestsQuery(
                TenantId,
                1,
                20,
                "  iluminação  ",
                null,
                createdFrom,
                null),
            TestContext.Current.CancellationToken);

        Assert.NotNull(readService.ReceivedQuery);
        Assert.Equal("iluminação", readService.ReceivedQuery.Search);
        Assert.Equal(TimeSpan.Zero, readService.ReceivedQuery.CreatedFromUtc?.Offset);
        Assert.Equal(createdFrom.UtcDateTime, readService.ReceivedQuery.CreatedFromUtc);
    }

    private sealed class RequestReadServiceStub : IRequestReadService
    {
        public ListRequestsQuery? ReceivedQuery { get; private set; }

        public Task<PagedRequestResult> ListAsync(
            ListRequestsQuery query,
            CancellationToken cancellationToken)
        {
            ReceivedQuery = query;

            return Task.FromResult(
                new PagedRequestResult([], query.Page, query.PageSize, 0, 0));
        }

        public Task<RequestDetailsResult?> GetDetailsAsync(
            Guid tenantId,
            Guid requestId,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<RequestDetailsResult?>(null);
        }

        public Task<RequestDashboardResult> GetDashboardAsync(
            Guid tenantId,
            DateTimeOffset currentDateUtc,
            CancellationToken cancellationToken)
        {
            return Task.FromResult(
                new RequestDashboardResult(
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    []));
        }

        public Task<PagedRequestCommentsResult?> ListCommentsAsync(
            ListRequestCommentsQuery query,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<PagedRequestCommentsResult?>(null);
        }

        public Task<PagedRequestAuditResult?> ListAuditAsync(
            ListRequestAuditQuery query,
            CancellationToken cancellationToken)
        {
            return Task.FromResult<PagedRequestAuditResult?>(null);
        }
    }
}

using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.ListRequests;
using CivicOps.Modules.Requests.Domain.Requests;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed partial class EfRequestReadService(RequestsDbContext dbContext)
    : IRequestReadService
{
    public async Task<PagedRequestResult> ListAsync(
        ListRequestsQuery query,
        CancellationToken cancellationToken)
    {
        var requests = dbContext.Requests
            .AsNoTracking()
            .Where(request => request.TenantId == query.TenantId);

        if (query.Status is not null)
        {
            requests = requests.Where(request => request.Status == query.Status);
        }

        if (query.CreatedFromUtc is not null)
        {
            requests = requests.Where(
                request => request.CreatedAtUtc >= query.CreatedFromUtc);
        }

        if (query.CreatedToUtc is not null)
        {
            requests = requests.Where(
                request => request.CreatedAtUtc <= query.CreatedToUtc);
        }

        if (query.Search is not null)
        {
            requests = ApplySearch(requests, query.Search);
        }

        var totalItems = await requests.LongCountAsync(cancellationToken);
        var skip = checked((query.Page - 1) * query.PageSize);

        var items = await requests
            .OrderByDescending(request => request.CreatedAtUtc)
            .ThenByDescending(request => request.Id)
            .Skip(skip)
            .Take(query.PageSize)
            .Select(request => new RequestListItem(
                request.Id,
                request.ProtocolNumber.Value,
                request.Title,
                request.Status.ToString(),
                request.CreatedAtUtc,
                request.Version))
            .ToListAsync(cancellationToken);

        var totalPages = totalItems == 0
            ? 0
            : (totalItems + query.PageSize - 1) / query.PageSize;

        return new PagedRequestResult(
            items,
            query.Page,
            query.PageSize,
            totalItems,
            totalPages);
    }

    public Task<RequestDetailsResult?> GetDetailsAsync(
        Guid tenantId,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        return dbContext.Requests
            .AsNoTracking()
            .Where(request =>
                request.TenantId == tenantId &&
                request.Id == requestId)
            .Select(request => new RequestDetailsResult(
                request.Id,
                request.ProtocolNumber.Value,
                request.Title,
                request.Description,
                request.Status.ToString(),
                request.CreatedAtUtc,
                request.Version))
            .SingleOrDefaultAsync(cancellationToken);
    }

    private static IQueryable<Request> ApplySearch(
        IQueryable<Request> requests,
        string search)
    {
        var escapedSearch = search
            .Replace(@"\", @"\\", StringComparison.Ordinal)
            .Replace("%", @"\%", StringComparison.Ordinal)
            .Replace("_", @"\_", StringComparison.Ordinal);
        var pattern = $"%{escapedSearch}%";

        if (ProtocolPattern().IsMatch(search))
        {
            var protocolNumber = ProtocolNumber.From(search);

            return requests.Where(request =>
                request.ProtocolNumber == protocolNumber ||
                EF.Functions.ILike(request.Title, pattern, @"\") ||
                EF.Functions.ILike(request.Description, pattern, @"\"));
        }

        return requests.Where(request =>
            EF.Functions.ILike(request.Title, pattern, @"\") ||
            EF.Functions.ILike(request.Description, pattern, @"\"));
    }

    [GeneratedRegex(@"^\d{4}-\d{6,}$", RegexOptions.CultureInvariant)]
    private static partial Regex ProtocolPattern();
}

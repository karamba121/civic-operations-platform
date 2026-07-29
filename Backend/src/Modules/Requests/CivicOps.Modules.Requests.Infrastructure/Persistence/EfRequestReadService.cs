using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.GetRequestDashboard;
using CivicOps.Modules.Requests.Application.ListRequestComments;
using CivicOps.Modules.Requests.Application.ListRequestAudit;
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
                request.ResponsibleUserId,
                request.DueDateUtc,
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
                request.ResponsibleUserId,
                request.DueDateUtc,
                request.CreatedAtUtc,
                request.Version))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<RequestDashboardResult> GetDashboardAsync(
        Guid tenantId,
        DateTimeOffset currentDateUtc,
        CancellationToken cancellationToken)
    {
        var dueSoonLimitUtc = currentDateUtc.AddDays(7);
        var requests = dbContext.Requests
            .AsNoTracking()
            .Where(request => request.TenantId == tenantId);

        var statusCounts = await requests
            .GroupBy(request => request.Status)
            .Select(group => new
            {
                Status = group.Key,
                Count = group.LongCount()
            })
            .ToListAsync(cancellationToken);

        var operational = await requests
            .Where(request =>
                request.Status == RequestStatus.Submitted ||
                request.Status == RequestStatus.InProgress)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                Overdue = group.LongCount(
                    request =>
                        request.DueDateUtc < currentDateUtc),
                DueSoon = group.LongCount(
                    request =>
                        request.DueDateUtc >= currentDateUtc &&
                        request.DueDateUtc <= dueSoonLimitUtc),
                UnassignedActive = group.LongCount(
                    request => request.ResponsibleUserId == null)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var recent = await requests
            .OrderByDescending(request => request.CreatedAtUtc)
            .ThenByDescending(request => request.Id)
            .Take(5)
            .Select(request => new RequestDashboardRecentItem(
                request.Id,
                request.ProtocolNumber.Value,
                request.Title,
                request.Status.ToString(),
                request.ResponsibleUserId,
                request.DueDateUtc,
                request.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        return new RequestDashboardResult(
            statusCounts.Sum(item => item.Count),
            Count(RequestStatus.Submitted),
            Count(RequestStatus.InProgress),
            Count(RequestStatus.Completed),
            Count(RequestStatus.Cancelled),
            operational?.Overdue ?? 0,
            operational?.DueSoon ?? 0,
            operational?.UnassignedActive ?? 0,
            recent);

        long Count(RequestStatus status)
        {
            return statusCounts
                .SingleOrDefault(item => item.Status == status)
                ?.Count ?? 0;
        }
    }

    public async Task<PagedRequestCommentsResult?> ListCommentsAsync(
        ListRequestCommentsQuery query,
        CancellationToken cancellationToken)
    {
        var requestExists = await dbContext.Requests
            .AsNoTracking()
            .AnyAsync(
                request =>
                    request.TenantId == query.TenantId &&
                    request.Id == query.RequestId,
                cancellationToken);

        if (!requestExists)
        {
            return null;
        }

        var comments = dbContext.RequestComments
            .AsNoTracking()
            .Where(comment =>
                comment.TenantId == query.TenantId &&
                comment.RequestId == query.RequestId);

        var totalItems = await comments.LongCountAsync(cancellationToken);
        var skip = checked((query.Page - 1) * query.PageSize);

        var items = await comments
            .OrderByDescending(comment => comment.CreatedAtUtc)
            .ThenByDescending(comment => comment.Id)
            .Skip(skip)
            .Take(query.PageSize)
            .Select(comment => new RequestCommentListItem(
                comment.Id,
                comment.AuthorUserId,
                comment.Content,
                comment.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        var totalPages = totalItems == 0
            ? 0
            : (totalItems + query.PageSize - 1) / query.PageSize;

        return new PagedRequestCommentsResult(
            items,
            query.Page,
            query.PageSize,
            totalItems,
            totalPages);
    }

    public async Task<PagedRequestAuditResult?> ListAuditAsync(
        ListRequestAuditQuery query,
        CancellationToken cancellationToken)
    {
        var requestExists = await dbContext.Requests
            .AsNoTracking()
            .AnyAsync(
                request =>
                    request.TenantId == query.TenantId &&
                    request.Id == query.RequestId,
                cancellationToken);

        if (!requestExists)
        {
            return null;
        }

        var audit = dbContext.RequestAudit
            .AsNoTracking()
            .Where(record =>
                record.TenantId == query.TenantId &&
                record.RequestId == query.RequestId);

        var totalItems = await audit.LongCountAsync(cancellationToken);
        var skip = checked((query.Page - 1) * query.PageSize);

        var items = await audit
            .OrderByDescending(record => record.OccurredAtUtc)
            .ThenByDescending(record => record.Id)
            .Skip(skip)
            .Take(query.PageSize)
            .Select(record => new RequestAuditListItem(
                record.Id,
                record.EventId,
                record.ActorUserId,
                record.Action,
                record.Data,
                record.OccurredAtUtc))
            .ToListAsync(cancellationToken);

        var totalPages = totalItems == 0
            ? 0
            : (totalItems + query.PageSize - 1) / query.PageSize;

        return new PagedRequestAuditResult(
            items,
            query.Page,
            query.PageSize,
            totalItems,
            totalPages);
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

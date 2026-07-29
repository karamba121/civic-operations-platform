using CivicOps.Modules.Notifications.Application.Abstractions;
using CivicOps.Modules.Notifications.Application.ListNotifications;
using Microsoft.EntityFrameworkCore;

namespace CivicOps.Modules.Notifications.Infrastructure.Persistence;

internal sealed class EfNotificationReadService(
    NotificationsDbContext dbContext) : INotificationReadService
{
    public async Task<PagedNotificationsResult> ListAsync(
        ListNotificationsQuery query,
        CancellationToken cancellationToken)
    {
        var notifications = dbContext.Notifications
            .AsNoTracking()
            .Where(notification =>
                notification.TenantId == query.TenantId &&
                notification.RecipientUserId == query.RecipientUserId);
        var totalItems = await notifications.LongCountAsync(cancellationToken);
        var skip = checked((query.Page - 1) * query.PageSize);
        var items = await notifications
            .OrderByDescending(notification => notification.CreatedAtUtc)
            .ThenByDescending(notification => notification.Id)
            .Skip(skip)
            .Take(query.PageSize)
            .Select(notification => new NotificationListItem(
                notification.Id,
                notification.RequestId,
                notification.ProtocolNumber,
                notification.Type.ToString(),
                notification.Title,
                notification.Content,
                notification.CreatedAtUtc))
            .ToListAsync(cancellationToken);
        var totalPages = totalItems == 0
            ? 0
            : (totalItems + query.PageSize - 1) / query.PageSize;

        return new PagedNotificationsResult(
            items,
            query.Page,
            query.PageSize,
            totalItems,
            totalPages);
    }
}

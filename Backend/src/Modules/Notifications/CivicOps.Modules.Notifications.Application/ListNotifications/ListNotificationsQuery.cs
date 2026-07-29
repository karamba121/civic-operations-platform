namespace CivicOps.Modules.Notifications.Application.ListNotifications;

public sealed record ListNotificationsQuery
{
    public ListNotificationsQuery(
        Guid tenantId,
        Guid recipientUserId,
        int page,
        int pageSize)
    {
        if (page is < 1 or > 1_000_000)
        {
            throw new NotificationQueryValidationException(
                "A página deve estar entre 1 e 1000000.");
        }

        if (pageSize is < 1 or > 100)
        {
            throw new NotificationQueryValidationException(
                "O tamanho da página deve estar entre 1 e 100.");
        }

        TenantId = tenantId;
        RecipientUserId = recipientUserId;
        Page = page;
        PageSize = pageSize;
    }

    public Guid TenantId { get; }

    public Guid RecipientUserId { get; }

    public int Page { get; }

    public int PageSize { get; }
}

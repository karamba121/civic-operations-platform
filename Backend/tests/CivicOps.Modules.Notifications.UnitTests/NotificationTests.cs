using CivicOps.BuildingBlocks.Domain;
using CivicOps.Modules.Notifications.Domain.Notifications;
using Xunit;

namespace CivicOps.Modules.Notifications.UnitTests;

public sealed class NotificationTests
{
    [Fact]
    public void CreateRequestAssigned_ShouldCreateNotificationForRecipient()
    {
        var tenantId = Guid.NewGuid();
        var recipientUserId = Guid.NewGuid();
        var requestId = Guid.NewGuid();
        var messageId = Guid.NewGuid();
        var createdAtUtc = DateTimeOffset.UtcNow;

        var notification = Notification.CreateRequestAssigned(
            messageId,
            tenantId,
            recipientUserId,
            requestId,
            "2026-000042",
            createdAtUtc);

        Assert.Equal(tenantId, notification.TenantId);
        Assert.Equal(messageId, notification.SourceMessageId);
        Assert.Equal(recipientUserId, notification.RecipientUserId);
        Assert.Equal(requestId, notification.RequestId);
        Assert.Equal("2026-000042", notification.ProtocolNumber);
        Assert.Equal(NotificationType.RequestAssigned, notification.Type);
        Assert.Contains("2026-000042", notification.Content);
        Assert.Equal(createdAtUtc, notification.CreatedAtUtc);
    }

    [Fact]
    public void CreateRequestAssigned_ShouldRejectEmptyRecipient()
    {
        var action = () => Notification.CreateRequestAssigned(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.Empty,
            Guid.NewGuid(),
            "2026-000001",
            DateTimeOffset.UtcNow);

        Assert.Throws<DomainException>(action);
    }
}

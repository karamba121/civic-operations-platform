using CivicOps.BuildingBlocks.Domain;
using CivicOps.Modules.Requests.Domain.Requests;
using CivicOps.Modules.Requests.Domain.Requests.Events;
using Xunit;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class RequestTests
{
    private static readonly Guid TenantId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid ActorUserId =
        Guid.Parse("22222222-2222-2222-2222-222222222222");

    [Fact]
    public void Create_ShouldCreateSubmittedRequest()
    {
        var createdAtUtc = new DateTimeOffset(
            2026,
            7,
            29,
            15,
            0,
            0,
            TimeSpan.Zero);

        var request = Request.Create(
            TenantId,
            ActorUserId,
            ProtocolNumber.Create(2026, 42),
            "  Iluminação pública  ",
            "  Poste sem iluminação.  ",
            createdAtUtc);

        Assert.NotEqual(Guid.Empty, request.Id);
        Assert.Equal(TenantId, request.TenantId);
        Assert.Equal(ActorUserId, request.CreatedByUserId);
        Assert.Equal("2026-000042", request.ProtocolNumber.Value);
        Assert.Equal("Iluminação pública", request.Title);
        Assert.Equal("Poste sem iluminação.", request.Description);
        Assert.Equal(RequestStatus.Submitted, request.Status);
        Assert.Equal(createdAtUtc, request.CreatedAtUtc);
        Assert.NotEqual(Guid.Empty, request.Version);

        var domainEvent = Assert.IsType<RequestCreatedDomainEvent>(
            Assert.Single(request.DomainEvents));
        Assert.Equal(ActorUserId, domainEvent.ActorUserId);
        Assert.Equal(request.Id, domainEvent.RequestId);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_ShouldRejectEmptyTitle(string title)
    {
        var action = () => Request.Create(
            TenantId,
            ActorUserId,
            ProtocolNumber.Create(2026, 1),
            title,
            "Descrição",
            DateTimeOffset.UtcNow);

        var exception = Assert.Throws<DomainException>(action);
        Assert.Equal("O título é obrigatório.", exception.Message);
    }

    [Fact]
    public void ProtocolNumber_ShouldRejectNonPositiveSequence()
    {
        var action = () => ProtocolNumber.Create(2026, 0);

        Assert.Throws<DomainException>(action);
    }

    [Fact]
    public void AssignResponsible_ShouldUpdateResponsibleAndVersion()
    {
        var request = CreateRequest();
        var previousVersion = request.Version;
        var responsibleUserId = Guid.NewGuid();

        request.AssignResponsible(
            responsibleUserId,
            previousVersion,
            ActorUserId,
            DateTimeOffset.UtcNow);

        Assert.Equal(responsibleUserId, request.ResponsibleUserId);
        Assert.NotEqual(previousVersion, request.Version);
    }

    [Fact]
    public void AssignResponsible_ShouldRejectStaleVersion()
    {
        var request = CreateRequest();

        var action = () =>
            request.AssignResponsible(
                Guid.NewGuid(),
                Guid.NewGuid(),
                ActorUserId,
                DateTimeOffset.UtcNow);

        Assert.Throws<RequestConcurrencyException>(action);
    }

    [Fact]
    public void AssignResponsible_ShouldRejectTerminalRequest()
    {
        var request = CreateRequest();
        request.ChangeStatus(
            RequestStatus.Cancelled,
            request.Version,
            ActorUserId,
            DateTimeOffset.UtcNow);

        var action = () =>
            request.AssignResponsible(
                Guid.NewGuid(),
                request.Version,
                ActorUserId,
                DateTimeOffset.UtcNow);

        Assert.Throws<DomainException>(action);
    }

    [Fact]
    public void ChangeStatus_ShouldFollowAllowedWorkflow()
    {
        var request = CreateRequest();

        request.ChangeStatus(
            RequestStatus.InProgress,
            request.Version,
            ActorUserId,
            DateTimeOffset.UtcNow);
        request.ChangeStatus(
            RequestStatus.Completed,
            request.Version,
            ActorUserId,
            DateTimeOffset.UtcNow);

        Assert.Equal(RequestStatus.Completed, request.Status);
    }

    [Fact]
    public void ChangeStatus_ShouldRejectInvalidTransition()
    {
        var request = CreateRequest();

        var action = () =>
            request.ChangeStatus(
                RequestStatus.Completed,
                request.Version,
                ActorUserId,
                DateTimeOffset.UtcNow);

        Assert.Throws<DomainException>(action);
    }

    [Fact]
    public void ChangeStatus_ShouldNotChangeVersionForNoOp()
    {
        var request = CreateRequest();
        var version = request.Version;
        request.ClearDomainEvents();

        request.ChangeStatus(
            RequestStatus.Submitted,
            version,
            ActorUserId,
            DateTimeOffset.UtcNow);

        Assert.Equal(version, request.Version);
        Assert.Empty(request.DomainEvents);
    }

    [Fact]
    public void SetDueDate_ShouldUpdateDueDateAndVersion()
    {
        var request = CreateRequest();
        var version = request.Version;
        var currentDateUtc = DateTimeOffset.UtcNow;
        var dueDateUtc = currentDateUtc.AddDays(5);

        request.SetDueDate(
            dueDateUtc,
            version,
            currentDateUtc,
            ActorUserId);

        Assert.Equal(dueDateUtc, request.DueDateUtc);
        Assert.NotEqual(version, request.Version);
    }

    [Fact]
    public void SetDueDate_ShouldRejectPastDate()
    {
        var request = CreateRequest();
        var currentDateUtc = DateTimeOffset.UtcNow;

        var action = () => request.SetDueDate(
            currentDateUtc.AddMinutes(-1),
            request.Version,
            currentDateUtc,
            ActorUserId);

        Assert.Throws<DomainException>(action);
    }

    [Fact]
    public void SetDueDate_ShouldAllowClearingCurrentDueDate()
    {
        var request = CreateRequest();
        var currentDateUtc = DateTimeOffset.UtcNow;
        request.SetDueDate(
            currentDateUtc.AddDays(5),
            request.Version,
            currentDateUtc,
            ActorUserId);
        var versionWithDueDate = request.Version;

        request.SetDueDate(
            null,
            versionWithDueDate,
            currentDateUtc,
            ActorUserId);

        Assert.Null(request.DueDateUtc);
        Assert.NotEqual(versionWithDueDate, request.Version);
    }

    [Fact]
    public void RequestComment_ShouldNormalizeContent()
    {
        var authorUserId = Guid.NewGuid();

        var comment = RequestComment.Create(
            TenantId,
            Guid.NewGuid(),
            authorUserId,
            "  Equipe acionada.  ",
            DateTimeOffset.UtcNow);

        Assert.Equal(authorUserId, comment.AuthorUserId);
        Assert.Equal("Equipe acionada.", comment.Content);
        Assert.NotEqual(Guid.Empty, comment.Id);
    }

    [Fact]
    public void RequestComment_ShouldRejectEmptyContent()
    {
        var action = () => RequestComment.Create(
            TenantId,
            Guid.NewGuid(),
            Guid.NewGuid(),
            " ",
            DateTimeOffset.UtcNow);

        Assert.Throws<DomainException>(action);
    }

    private static Request CreateRequest()
    {
        return Request.Create(
            TenantId,
            ActorUserId,
            ProtocolNumber.Create(2026, 1),
            "Título",
            "Descrição",
            DateTimeOffset.UtcNow);
    }
}

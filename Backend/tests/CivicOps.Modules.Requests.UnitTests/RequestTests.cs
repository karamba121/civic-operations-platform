using CivicOps.BuildingBlocks.Domain;
using CivicOps.Modules.Requests.Domain.Requests;
using Xunit;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class RequestTests
{
    private static readonly Guid TenantId =
        Guid.Parse("11111111-1111-1111-1111-111111111111");

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
            ProtocolNumber.Create(2026, 42),
            "  Iluminação pública  ",
            "  Poste sem iluminação.  ",
            createdAtUtc);

        Assert.NotEqual(Guid.Empty, request.Id);
        Assert.Equal(TenantId, request.TenantId);
        Assert.Equal("2026-000042", request.ProtocolNumber.Value);
        Assert.Equal("Iluminação pública", request.Title);
        Assert.Equal("Poste sem iluminação.", request.Description);
        Assert.Equal(RequestStatus.Submitted, request.Status);
        Assert.Equal(createdAtUtc, request.CreatedAtUtc);
        Assert.NotEqual(Guid.Empty, request.Version);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_ShouldRejectEmptyTitle(string title)
    {
        var action = () => Request.Create(
            TenantId,
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

        request.AssignResponsible(responsibleUserId, previousVersion);

        Assert.Equal(responsibleUserId, request.ResponsibleUserId);
        Assert.NotEqual(previousVersion, request.Version);
    }

    [Fact]
    public void AssignResponsible_ShouldRejectStaleVersion()
    {
        var request = CreateRequest();

        var action = () =>
            request.AssignResponsible(Guid.NewGuid(), Guid.NewGuid());

        Assert.Throws<RequestConcurrencyException>(action);
    }

    [Fact]
    public void AssignResponsible_ShouldRejectTerminalRequest()
    {
        var request = CreateRequest();
        request.ChangeStatus(RequestStatus.Cancelled, request.Version);

        var action = () =>
            request.AssignResponsible(Guid.NewGuid(), request.Version);

        Assert.Throws<DomainException>(action);
    }

    [Fact]
    public void ChangeStatus_ShouldFollowAllowedWorkflow()
    {
        var request = CreateRequest();

        request.ChangeStatus(RequestStatus.InProgress, request.Version);
        request.ChangeStatus(RequestStatus.Completed, request.Version);

        Assert.Equal(RequestStatus.Completed, request.Status);
    }

    [Fact]
    public void ChangeStatus_ShouldRejectInvalidTransition()
    {
        var request = CreateRequest();

        var action = () =>
            request.ChangeStatus(RequestStatus.Completed, request.Version);

        Assert.Throws<DomainException>(action);
    }

    [Fact]
    public void ChangeStatus_ShouldNotChangeVersionForNoOp()
    {
        var request = CreateRequest();
        var version = request.Version;

        request.ChangeStatus(RequestStatus.Submitted, version);

        Assert.Equal(version, request.Version);
    }

    private static Request CreateRequest()
    {
        return Request.Create(
            TenantId,
            ProtocolNumber.Create(2026, 1),
            "Título",
            "Descrição",
            DateTimeOffset.UtcNow);
    }
}

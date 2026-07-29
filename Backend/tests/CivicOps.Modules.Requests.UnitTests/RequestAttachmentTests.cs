using CivicOps.BuildingBlocks.Domain;
using CivicOps.Modules.Requests.Domain.Requests;
using CivicOps.Modules.Requests.Domain.Requests.Events;
using Xunit;

namespace CivicOps.Modules.Requests.UnitTests;

public sealed class RequestAttachmentTests
{
    private static readonly Guid TenantId = Guid.Parse(
        "11111111-1111-1111-1111-111111111111");
    private static readonly Guid RequestId = Guid.Parse(
        "22222222-2222-2222-2222-222222222222");
    private static readonly Guid UserId = Guid.Parse(
        "33333333-3333-3333-3333-333333333333");
    private const string Sha256 =
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    [Fact]
    public void Create_ShouldNormalizeMetadata()
    {
        var createdAtUtc = new DateTimeOffset(
            2026,
            7,
            29,
            18,
            0,
            0,
            TimeSpan.Zero);

        var attachment = RequestAttachment.Create(
            Guid.CreateVersion7(),
            TenantId,
            RequestId,
            UserId,
            " evidence.txt ",
            " text/plain ",
            42,
            "tenant/request/attachment",
            Sha256.ToUpperInvariant(),
            createdAtUtc);

        Assert.Equal("evidence.txt", attachment.FileName);
        Assert.Equal("text/plain", attachment.ContentType);
        Assert.Equal(42, attachment.SizeBytes);
        Assert.Equal(Sha256, attachment.Sha256);
        Assert.Equal(createdAtUtc, attachment.CreatedAtUtc);
    }

    [Fact]
    public void Create_ShouldRejectEmptyContent()
    {
        var action = () => RequestAttachment.Create(
            Guid.CreateVersion7(),
            TenantId,
            RequestId,
            UserId,
            "evidence.txt",
            "text/plain",
            0,
            "tenant/request/attachment",
            Sha256,
            DateTimeOffset.UtcNow);

        var exception = Assert.Throws<DomainException>(action);

        Assert.Equal(
            "O conteúdo do anexo não pode estar vazio.",
            exception.Message);
    }

    [Fact]
    public void RegisterAttachment_ShouldRaiseDomainEvent()
    {
        var nowUtc = DateTimeOffset.UtcNow;
        var request = Request.Create(
            TenantId,
            UserId,
            ProtocolNumber.Create(2026, 1),
            "Solicitação",
            "Descrição",
            nowUtc);
        request.ClearDomainEvents();
        var attachment = RequestAttachment.Create(
            Guid.CreateVersion7(),
            TenantId,
            request.Id,
            UserId,
            "evidence.txt",
            "text/plain",
            42,
            "tenant/request/attachment",
            Sha256,
            nowUtc);

        request.RegisterAttachment(
            attachment,
            UserId,
            nowUtc);

        var domainEvent =
            Assert.IsType<RequestAttachmentAddedDomainEvent>(
                Assert.Single(request.DomainEvents));
        Assert.Equal(attachment.Id, domainEvent.AttachmentId);
        Assert.Equal(attachment.Sha256, domainEvent.Sha256);
        Assert.Equal(request.Id, domainEvent.RequestId);
    }
}

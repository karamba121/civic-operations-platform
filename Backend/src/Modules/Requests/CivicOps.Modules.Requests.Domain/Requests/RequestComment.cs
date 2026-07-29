using CivicOps.BuildingBlocks.Domain;

namespace CivicOps.Modules.Requests.Domain.Requests;

public sealed class RequestComment
{
    private const int ContentMaxLength = 2_000;

    private RequestComment(
        Guid id,
        Guid tenantId,
        Guid requestId,
        Guid authorUserId,
        string content,
        DateTimeOffset createdAtUtc)
    {
        Id = id;
        TenantId = tenantId;
        RequestId = requestId;
        AuthorUserId = authorUserId;
        Content = content;
        CreatedAtUtc = createdAtUtc;
    }

    private RequestComment()
    {
        Content = null!;
    }

    public Guid Id { get; private init; }

    public Guid TenantId { get; private init; }

    public Guid RequestId { get; private init; }

    public Guid AuthorUserId { get; private init; }

    public string Content { get; private init; }

    public DateTimeOffset CreatedAtUtc { get; private init; }

    public static RequestComment Create(
        Guid tenantId,
        Guid requestId,
        Guid authorUserId,
        string content,
        DateTimeOffset createdAtUtc)
    {
        if (tenantId == Guid.Empty)
        {
            throw new DomainException("O tenant é obrigatório.");
        }

        if (requestId == Guid.Empty)
        {
            throw new DomainException("A solicitação é obrigatória.");
        }

        if (authorUserId == Guid.Empty)
        {
            throw new DomainException("O autor do comentário é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new DomainException("O comentário é obrigatório.");
        }

        content = content.Trim();

        if (content.Length > ContentMaxLength)
        {
            throw new DomainException(
                $"O comentário deve ter no máximo {ContentMaxLength} caracteres.");
        }

        if (createdAtUtc.Offset != TimeSpan.Zero)
        {
            throw new DomainException("A data do comentário deve estar em UTC.");
        }

        return new RequestComment(
            Guid.CreateVersion7(),
            tenantId,
            requestId,
            authorUserId,
            content,
            createdAtUtc);
    }
}

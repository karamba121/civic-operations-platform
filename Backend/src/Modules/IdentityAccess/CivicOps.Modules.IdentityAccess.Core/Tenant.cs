using CivicOps.BuildingBlocks.Domain;
using System.Text.RegularExpressions;

namespace CivicOps.Modules.IdentityAccess;

public sealed partial class Tenant
{
    private Tenant(
        Guid id,
        string name,
        string slug,
        Guid createdByUserId,
        DateTimeOffset createdAtUtc)
    {
        Id = id;
        Name = name;
        Slug = slug;
        IsActive = true;
        CreatedByUserId = createdByUserId;
        CreatedAtUtc = createdAtUtc;
        UpdatedAtUtc = createdAtUtc;
    }

    private Tenant()
    {
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Slug { get; private set; } = string.Empty;

    public bool IsActive { get; private set; }

    public Guid CreatedByUserId { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public static Tenant Create(
        string name,
        string slug,
        Guid actorUserId,
        DateTimeOffset createdAtUtc)
    {
        var normalizedName = name.Trim();
        var normalizedSlug = slug.Trim().ToLowerInvariant();

        if (normalizedName.Length is < 3 or > 160)
        {
            throw new DomainException(
                "O nome do tenant deve possuir entre 3 e 160 caracteres.");
        }

        if (!SlugPattern().IsMatch(normalizedSlug))
        {
            throw new DomainException(
                "O identificador do tenant deve usar letras minúsculas, " +
                "números e hífens.");
        }

        EnsureIdentifier(actorUserId);
        EnsureUtc(createdAtUtc);

        return new Tenant(
            Guid.CreateVersion7(),
            normalizedName,
            normalizedSlug,
            actorUserId,
            createdAtUtc);
    }

    private static void EnsureIdentifier(Guid value)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException("O usuário autor é obrigatório.");
        }
    }

    private static void EnsureUtc(DateTimeOffset value)
    {
        if (value.Offset != TimeSpan.Zero)
        {
            throw new DomainException("A data deve estar em UTC.");
        }
    }

    [GeneratedRegex("^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$")]
    private static partial Regex SlugPattern();
}

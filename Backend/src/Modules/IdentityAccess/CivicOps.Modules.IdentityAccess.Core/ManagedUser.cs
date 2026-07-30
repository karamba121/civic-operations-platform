using CivicOps.BuildingBlocks.Domain;

namespace CivicOps.Modules.IdentityAccess;

public sealed class ManagedUser
{
    private ManagedUser(
        Guid id,
        string username,
        string displayName,
        string email,
        Guid? tenantId,
        bool isPlatformAdministrator,
        Guid createdByUserId,
        DateTimeOffset createdAtUtc)
    {
        Id = id;
        Username = username;
        DisplayName = displayName;
        Email = email;
        TenantId = tenantId;
        IsPlatformAdministrator = isPlatformAdministrator;
        IsActive = true;
        CreatedByUserId = createdByUserId;
        CreatedAtUtc = createdAtUtc;
    }

    private ManagedUser()
    {
    }

    public Guid Id { get; private set; }

    public string Username { get; private set; } = string.Empty;

    public string DisplayName { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public Guid? TenantId { get; private set; }

    public bool IsPlatformAdministrator { get; private set; }

    public bool IsActive { get; private set; }

    public Guid CreatedByUserId { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public static ManagedUser CreatePlatformAdministrator(
        Guid identityProviderUserId,
        string username,
        string displayName,
        string email,
        Guid actorUserId,
        DateTimeOffset createdAtUtc)
    {
        return Create(
            identityProviderUserId,
            username,
            displayName,
            email,
            tenantId: null,
            isPlatformAdministrator: true,
            actorUserId,
            createdAtUtc);
    }

    public static ManagedUser CreateTenantUser(
        Guid identityProviderUserId,
        Guid tenantId,
        string username,
        string displayName,
        string email,
        Guid actorUserId,
        DateTimeOffset createdAtUtc)
    {
        if (tenantId == Guid.Empty)
        {
            throw new DomainException("O tenant é obrigatório.");
        }

        return Create(
            identityProviderUserId,
            username,
            displayName,
            email,
            tenantId,
            isPlatformAdministrator: false,
            actorUserId,
            createdAtUtc);
    }

    private static ManagedUser Create(
        Guid identityProviderUserId,
        string username,
        string displayName,
        string email,
        Guid? tenantId,
        bool isPlatformAdministrator,
        Guid actorUserId,
        DateTimeOffset createdAtUtc)
    {
        if (identityProviderUserId == Guid.Empty ||
            actorUserId == Guid.Empty)
        {
            throw new DomainException(
                "Os identificadores de usuário são obrigatórios.");
        }

        var normalizedUsername = username.Trim().ToLowerInvariant();
        var normalizedDisplayName = displayName.Trim();
        var normalizedEmail = email.Trim().ToLowerInvariant();

        if (normalizedUsername.Length is < 3 or > 80 ||
            normalizedDisplayName.Length is < 3 or > 160 ||
            normalizedEmail.Length is < 5 or > 254 ||
            !normalizedEmail.Contains('@', StringComparison.Ordinal))
        {
            throw new DomainException(
                "Informe login, nome e e-mail válidos.");
        }

        if (createdAtUtc.Offset != TimeSpan.Zero)
        {
            throw new DomainException("A data deve estar em UTC.");
        }

        return new ManagedUser(
            identityProviderUserId,
            normalizedUsername,
            normalizedDisplayName,
            normalizedEmail,
            tenantId,
            isPlatformAdministrator,
            actorUserId,
            createdAtUtc);
    }
}

using CivicOps.BuildingBlocks.Domain;

namespace CivicOps.Modules.IdentityAccess;

public sealed class TenantMembership
{
    private TenantMembership(
        Guid id,
        Guid tenantId,
        Guid userId,
        TenantRole role,
        Guid createdByUserId,
        DateTimeOffset createdAtUtc)
    {
        Id = id;
        TenantId = tenantId;
        UserId = userId;
        Role = role;
        IsActive = true;
        CreatedByUserId = createdByUserId;
        CreatedAtUtc = createdAtUtc;
        UpdatedByUserId = createdByUserId;
        UpdatedAtUtc = createdAtUtc;
    }

    private TenantMembership()
    {
    }

    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }

    public Guid UserId { get; private set; }

    public TenantRole Role { get; private set; }

    public bool IsActive { get; private set; }

    public Guid CreatedByUserId { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public Guid UpdatedByUserId { get; private set; }

    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public static TenantMembership Create(
        Guid tenantId,
        Guid userId,
        TenantRole role,
        Guid actorUserId,
        DateTimeOffset createdAtUtc)
    {
        EnsureIdentifier(tenantId, "O tenant é obrigatório.");
        EnsureIdentifier(userId, "O usuário é obrigatório.");
        EnsureIdentifier(actorUserId, "O autor da concessão é obrigatório.");
        EnsureUtc(createdAtUtc);

        return new TenantMembership(
            Guid.CreateVersion7(),
            tenantId,
            userId,
            role,
            actorUserId,
            createdAtUtc);
    }

    public void ChangeRole(
        TenantRole role,
        Guid actorUserId,
        DateTimeOffset updatedAtUtc)
    {
        EnsureIdentifier(actorUserId, "O autor da alteração é obrigatório.");
        EnsureUtc(updatedAtUtc);

        Role = role;
        IsActive = true;
        UpdatedByUserId = actorUserId;
        UpdatedAtUtc = updatedAtUtc;
    }

    private static void EnsureIdentifier(Guid value, string message)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException(message);
        }
    }

    private static void EnsureUtc(DateTimeOffset value)
    {
        if (value.Offset != TimeSpan.Zero)
        {
            throw new DomainException("A data da associação deve estar em UTC.");
        }
    }
}

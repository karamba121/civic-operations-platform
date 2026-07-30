namespace CivicOps.Modules.IdentityAccess;

public sealed record TenantResult(
    Guid Id,
    string Name,
    string Slug,
    bool IsActive,
    DateTimeOffset CreatedAtUtc);

public sealed record ManagedUserResult(
    Guid Id,
    string Username,
    string DisplayName,
    string Email,
    Guid? TenantId,
    bool IsPlatformAdministrator,
    string? Role,
    bool IsActive,
    DateTimeOffset CreatedAtUtc);

public sealed record CreateTenantCommand(
    string Name,
    string Slug,
    string AdministratorUsername,
    string AdministratorDisplayName,
    string AdministratorEmail,
    string AdministratorPassword);

public sealed record CreateManagedUserCommand(
    string Username,
    string DisplayName,
    string Email,
    string Password,
    TenantRole Role);

public sealed record ProvisionIdentityRequest(
    string Username,
    string DisplayName,
    string Email,
    string Password,
    Guid? TenantId,
    string? TenantName,
    bool IsPlatformAdministrator);

public sealed record ProvisionedIdentity(Guid UserId);

public interface IManagedIdentityProvider
{
    Task<ProvisionedIdentity> CreateAsync(
        ProvisionIdentityRequest request,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        Guid userId,
        CancellationToken cancellationToken);
}

public interface ITenantRepository
{
    void Add(Tenant tenant);

    Task<bool> SlugExistsAsync(
        string slug,
        CancellationToken cancellationToken);

    Task<Tenant?> GetAsync(
        Guid tenantId,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Tenant>> ListAsync(
        CancellationToken cancellationToken);
}

public interface IManagedUserRepository
{
    void Add(ManagedUser user);

    Task<bool> UsernameExistsAsync(
        string username,
        CancellationToken cancellationToken);

    Task<bool> IsActivePlatformAdministratorAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<ManagedUser>> ListPlatformAdministratorsAsync(
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<ManagedUser>> ListTenantUsersAsync(
        Guid tenantId,
        CancellationToken cancellationToken);
}

public interface IPlatformAdministrationAuditWriter
{
    void Write(
        Guid actorUserId,
        Guid? targetTenantId,
        Guid? targetUserId,
        string action,
        string data,
        DateTimeOffset occurredAtUtc);
}

public sealed class ManagedIdentityConflictException(string message)
    : Exception(message);

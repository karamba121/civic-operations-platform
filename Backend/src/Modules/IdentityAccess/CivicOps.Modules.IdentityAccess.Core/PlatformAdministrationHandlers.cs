using CivicOps.BuildingBlocks.Domain;
using System.Text.Json;

namespace CivicOps.Modules.IdentityAccess;

public sealed class CreateTenantHandler(
    ITenantRepository tenants,
    IManagedUserRepository users,
    ITenantMembershipRepository memberships,
    IManagedIdentityProvider identityProvider,
    IPlatformAdministrationAuditWriter auditWriter,
    IIdentityAccessUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public async Task<TenantResult> HandleAsync(
        Guid actorUserId,
        CreateTenantCommand command,
        CancellationToken cancellationToken)
    {
        await EnsurePlatformAdministratorAsync(
            users,
            actorUserId,
            cancellationToken);
        ValidatePassword(command.AdministratorPassword);

        var nowUtc = timeProvider.GetUtcNow();
        var tenant = Tenant.Create(
            command.Name,
            command.Slug,
            actorUserId,
            nowUtc);

        if (await tenants.SlugExistsAsync(
                tenant.Slug,
                cancellationToken))
        {
            throw new ManagedIdentityConflictException(
                "Já existe um tenant com esse identificador.");
        }

        if (await users.UsernameExistsAsync(
                command.AdministratorUsername,
                cancellationToken))
        {
            throw new ManagedIdentityConflictException(
                "O login informado já está em uso.");
        }

        var identity = await identityProvider.CreateAsync(
            new ProvisionIdentityRequest(
                command.AdministratorUsername,
                command.AdministratorDisplayName,
                command.AdministratorEmail,
                command.AdministratorPassword,
                tenant.Id,
                tenant.Name,
                IsPlatformAdministrator: false),
            cancellationToken);

        try
        {
            return await unitOfWork.ExecuteInTransactionAsync(
                async transactionCancellationToken =>
                {
                    tenants.Add(tenant);
                    users.Add(ManagedUser.CreateTenantUser(
                        identity.UserId,
                        tenant.Id,
                        command.AdministratorUsername,
                        command.AdministratorDisplayName,
                        command.AdministratorEmail,
                        actorUserId,
                        nowUtc));
                    memberships.Add(TenantMembership.Create(
                        tenant.Id,
                        identity.UserId,
                        TenantRole.Administrator,
                        actorUserId,
                        nowUtc));
                    auditWriter.Write(
                        actorUserId,
                        tenant.Id,
                        identity.UserId,
                        "TenantCreated",
                        JsonSerializer.Serialize(new
                        {
                            tenant.Name,
                            tenant.Slug,
                            administrator =
                                command.AdministratorUsername
                        }),
                        nowUtc);

                    await Task.CompletedTask;
                    return ToResult(tenant);
                },
                cancellationToken);
        }
        catch
        {
            await TryCompensateAsync(
                identityProvider,
                identity.UserId,
                CancellationToken.None);
            throw;
        }
    }

    private static TenantResult ToResult(Tenant tenant)
    {
        return new TenantResult(
            tenant.Id,
            tenant.Name,
            tenant.Slug,
            tenant.IsActive,
            tenant.CreatedAtUtc);
    }

    internal static async Task EnsurePlatformAdministratorAsync(
        IManagedUserRepository users,
        Guid actorUserId,
        CancellationToken cancellationToken)
    {
        if (actorUserId == Guid.Empty ||
            !await users.IsActivePlatformAdministratorAsync(
                actorUserId,
                cancellationToken))
        {
            throw new IdentityAccessDeniedException(
                "platform.access.manage");
        }
    }

    internal static void ValidatePassword(string password)
    {
        if (password.Length is < 8 or > 128)
        {
            throw new DomainException(
                "A senha deve possuir entre 8 e 128 caracteres.");
        }
    }

    internal static async Task TryCompensateAsync(
        IManagedIdentityProvider identityProvider,
        Guid userId,
        CancellationToken cancellationToken)
    {
        try
        {
            await identityProvider.DeleteAsync(userId, cancellationToken);
        }
        catch
        {
            // A falha original deve ser preservada. A reconciliação operacional
            // localizará a identidade sem vínculo local.
        }
    }
}

public sealed class ListTenantsHandler(
    ITenantRepository tenants,
    IManagedUserRepository users)
{
    public async Task<IReadOnlyCollection<TenantResult>> HandleAsync(
        Guid actorUserId,
        CancellationToken cancellationToken)
    {
        await CreateTenantHandler.EnsurePlatformAdministratorAsync(
            users,
            actorUserId,
            cancellationToken);

        return (await tenants.ListAsync(cancellationToken))
            .Select(tenant => new TenantResult(
                tenant.Id,
                tenant.Name,
                tenant.Slug,
                tenant.IsActive,
                tenant.CreatedAtUtc))
            .ToArray();
    }
}

public sealed class CreatePlatformAdministratorHandler(
    IManagedUserRepository users,
    IManagedIdentityProvider identityProvider,
    IPlatformAdministrationAuditWriter auditWriter,
    IIdentityAccessUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public async Task<ManagedUserResult> HandleAsync(
        Guid actorUserId,
        string username,
        string displayName,
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        await CreateTenantHandler.EnsurePlatformAdministratorAsync(
            users,
            actorUserId,
            cancellationToken);
        CreateTenantHandler.ValidatePassword(password);

        if (await users.UsernameExistsAsync(
                username,
                cancellationToken))
        {
            throw new ManagedIdentityConflictException(
                "O login informado já está em uso.");
        }

        var identity = await identityProvider.CreateAsync(
            new ProvisionIdentityRequest(
                username,
                displayName,
                email,
                password,
                TenantId: null,
                TenantName: null,
                IsPlatformAdministrator: true),
            cancellationToken);
        var nowUtc = timeProvider.GetUtcNow();
        var user = ManagedUser.CreatePlatformAdministrator(
            identity.UserId,
            username,
            displayName,
            email,
            actorUserId,
            nowUtc);

        try
        {
            return await unitOfWork.ExecuteInTransactionAsync(
                async transactionCancellationToken =>
                {
                    users.Add(user);
                    auditWriter.Write(
                        actorUserId,
                        targetTenantId: null,
                        user.Id,
                        "PlatformAdministratorCreated",
                        JsonSerializer.Serialize(new
                        {
                            user.Username,
                            user.Email
                        }),
                        nowUtc);
                    await Task.CompletedTask;
                    return ToResult(user, role: null);
                },
                cancellationToken);
        }
        catch
        {
            await CreateTenantHandler.TryCompensateAsync(
                identityProvider,
                identity.UserId,
                CancellationToken.None);
            throw;
        }
    }

    internal static ManagedUserResult ToResult(
        ManagedUser user,
        string? role)
    {
        return new ManagedUserResult(
            user.Id,
            user.Username,
            user.DisplayName,
            user.Email,
            user.TenantId,
            user.IsPlatformAdministrator,
            role,
            user.IsActive,
            user.CreatedAtUtc);
    }
}

public sealed class ListPlatformAdministratorsHandler(
    IManagedUserRepository users)
{
    public async Task<IReadOnlyCollection<ManagedUserResult>> HandleAsync(
        Guid actorUserId,
        CancellationToken cancellationToken)
    {
        await CreateTenantHandler.EnsurePlatformAdministratorAsync(
            users,
            actorUserId,
            cancellationToken);

        return (await users.ListPlatformAdministratorsAsync(
                cancellationToken))
            .Select(user =>
                CreatePlatformAdministratorHandler.ToResult(
                    user,
                    role: null))
            .ToArray();
    }
}

public sealed class CreateTenantUserHandler(
    ITenantRepository tenants,
    IManagedUserRepository users,
    ITenantMembershipRepository memberships,
    IPermissionAuthorizer authorizer,
    IManagedIdentityProvider identityProvider,
    IIdentityAccessAuditWriter auditWriter,
    IIdentityAccessUnitOfWork unitOfWork,
    TimeProvider timeProvider)
{
    public async Task<ManagedUserResult> HandleAsync(
        Guid tenantId,
        Guid actorUserId,
        CreateManagedUserCommand command,
        CancellationToken cancellationToken)
    {
        if (!await authorizer.HasPermissionAsync(
                tenantId,
                actorUserId,
                PermissionNames.AccessManage,
                cancellationToken))
        {
            throw new IdentityAccessDeniedException(
                PermissionNames.AccessManage);
        }

        CreateTenantHandler.ValidatePassword(command.Password);
        var tenant = await tenants.GetAsync(tenantId, cancellationToken)
            ?? throw new DomainException("Tenant não encontrado.");

        if (!tenant.IsActive)
        {
            throw new DomainException("O tenant está inativo.");
        }

        if (await users.UsernameExistsAsync(
                command.Username,
                cancellationToken))
        {
            throw new ManagedIdentityConflictException(
                "O login informado já está em uso.");
        }

        var identity = await identityProvider.CreateAsync(
            new ProvisionIdentityRequest(
                command.Username,
                command.DisplayName,
                command.Email,
                command.Password,
                tenant.Id,
                tenant.Name,
                IsPlatformAdministrator: false),
            cancellationToken);
        var nowUtc = timeProvider.GetUtcNow();
        var user = ManagedUser.CreateTenantUser(
            identity.UserId,
            tenant.Id,
            command.Username,
            command.DisplayName,
            command.Email,
            actorUserId,
            nowUtc);

        try
        {
            return await unitOfWork.ExecuteInTransactionAsync(
                async transactionCancellationToken =>
                {
                    users.Add(user);
                    memberships.Add(TenantMembership.Create(
                        tenant.Id,
                        user.Id,
                        command.Role,
                        actorUserId,
                        nowUtc));
                    auditWriter.Add(
                        tenant.Id,
                        actorUserId,
                        user.Id,
                        "TenantUserCreated",
                        JsonSerializer.Serialize(new
                        {
                            user.Username,
                            role = command.Role.ToString()
                        }),
                        nowUtc);
                    await Task.CompletedTask;
                    return CreatePlatformAdministratorHandler.ToResult(
                        user,
                        command.Role.ToString());
                },
                cancellationToken);
        }
        catch
        {
            await CreateTenantHandler.TryCompensateAsync(
                identityProvider,
                identity.UserId,
                CancellationToken.None);
            throw;
        }
    }
}

public sealed class ListTenantUsersHandler(
    IManagedUserRepository users,
    ITenantMembershipRepository memberships,
    IPermissionAuthorizer authorizer)
{
    public async Task<IReadOnlyCollection<ManagedUserResult>> HandleAsync(
        Guid tenantId,
        Guid actorUserId,
        CancellationToken cancellationToken)
    {
        if (!await authorizer.HasPermissionAsync(
                tenantId,
                actorUserId,
                PermissionNames.AccessManage,
                cancellationToken))
        {
            throw new IdentityAccessDeniedException(
                PermissionNames.AccessManage);
        }

        var managedUsers =
            await users.ListTenantUsersAsync(tenantId, cancellationToken);
        var tenantMemberships =
            await memberships.ListAsync(tenantId, cancellationToken);
        var roles = tenantMemberships.ToDictionary(
            membership => membership.UserId,
            membership => membership.Role.ToString());

        return managedUsers
            .Select(user =>
                CreatePlatformAdministratorHandler.ToResult(
                    user,
                    roles.GetValueOrDefault(user.Id)))
            .ToArray();
    }
}

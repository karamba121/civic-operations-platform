using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CivicOps.Modules.IdentityAccess.Infrastructure;

public static class PlatformAdministrationEndpoints
{
    private const string UserHeader = "X-User-Id";
    private const string TenantHeader = "X-Tenant-Id";
    private const string PlatformAdministratorHeader =
        "X-Platform-Administrator";

    public static IEndpointRouteBuilder
        MapPlatformAdministrationEndpoints(
            this IEndpointRouteBuilder endpoints)
    {
        var platform = endpoints
            .MapGroup("/api/v1/platform")
            .WithTags("Platform Administration");

        platform.MapGet(
            "/tenants",
            async (
                HttpContext context,
                ListTenantsHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetPlatformActor(
                        context,
                        out var actorUserId,
                        out var problem))
                {
                    return problem;
                }

                return Results.Ok(await handler.HandleAsync(
                    actorUserId,
                    cancellationToken));
            })
            .WithName("ListTenants")
            .Produces<IReadOnlyCollection<TenantResult>>(
                StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        platform.MapPost(
            "/tenants",
            async (
                CreateTenantRequest request,
                HttpContext context,
                CreateTenantHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetPlatformActor(
                        context,
                        out var actorUserId,
                        out var problem))
                {
                    return problem;
                }

                try
                {
                    var result = await handler.HandleAsync(
                        actorUserId,
                        new CreateTenantCommand(
                            request.Name,
                            request.Slug,
                            request.AdministratorUsername,
                            request.AdministratorDisplayName,
                            request.AdministratorEmail,
                            request.AdministratorPassword),
                        cancellationToken);
                    return Results.Created(
                        $"/api/v1/platform/tenants/{result.Id}",
                        result);
                }
                catch (ManagedIdentityConflictException exception)
                {
                    return Conflict(exception.Message);
                }
            })
            .WithName("CreateTenant")
            .Produces<TenantResult>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);

        platform.MapGet(
            "/administrators",
            async (
                HttpContext context,
                ListPlatformAdministratorsHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetPlatformActor(
                        context,
                        out var actorUserId,
                        out var problem))
                {
                    return problem;
                }

                return Results.Ok(await handler.HandleAsync(
                    actorUserId,
                    cancellationToken));
            })
            .WithName("ListPlatformAdministrators")
            .Produces<IReadOnlyCollection<ManagedUserResult>>(
                StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        platform.MapPost(
            "/administrators",
            async (
                CreatePlatformAdministratorRequest request,
                HttpContext context,
                CreatePlatformAdministratorHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetPlatformActor(
                        context,
                        out var actorUserId,
                        out var problem))
                {
                    return problem;
                }

                try
                {
                    var result = await handler.HandleAsync(
                        actorUserId,
                        request.Username,
                        request.DisplayName,
                        request.Email,
                        request.Password,
                        cancellationToken);
                    return Results.Created(
                        $"/api/v1/platform/administrators/{result.Id}",
                        result);
                }
                catch (ManagedIdentityConflictException exception)
                {
                    return Conflict(exception.Message);
                }
            })
            .WithName("CreatePlatformAdministrator")
            .Produces<ManagedUserResult>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);

        var tenantUsers = endpoints
            .MapGroup("/api/v1/access/users")
            .WithTags("Identity & Access");

        tenantUsers.MapGet(
            "/",
            async (
                HttpContext context,
                ListTenantUsersHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetTenantActor(
                        context,
                        out var tenantId,
                        out var actorUserId,
                        out var problem))
                {
                    return problem;
                }

                return Results.Ok(await handler.HandleAsync(
                    tenantId,
                    actorUserId,
                    cancellationToken));
            })
            .WithName("ListTenantUsers")
            .Produces<IReadOnlyCollection<ManagedUserResult>>(
                StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        tenantUsers.MapPost(
            "/",
            async (
                CreateTenantUserRequest request,
                HttpContext context,
                CreateTenantUserHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetTenantActor(
                        context,
                        out var tenantId,
                        out var actorUserId,
                        out var problem))
                {
                    return problem;
                }

                if (!Enum.TryParse<TenantRole>(
                        request.Role,
                        ignoreCase: true,
                        out var role) ||
                    !Enum.IsDefined(role))
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status400BadRequest,
                        title: "Papel inválido",
                        detail:
                            "Informe Administrator, Operator ou Reader.");
                }

                try
                {
                    var result = await handler.HandleAsync(
                        tenantId,
                        actorUserId,
                        new CreateManagedUserCommand(
                            request.Username,
                            request.DisplayName,
                            request.Email,
                            request.Password,
                            role),
                        cancellationToken);
                    return Results.Created(
                        $"/api/v1/access/users/{result.Id}",
                        result);
                }
                catch (ManagedIdentityConflictException exception)
                {
                    return Conflict(exception.Message);
                }
            })
            .WithName("CreateTenantUser")
            .Produces<ManagedUserResult>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return endpoints;
    }

    private static bool TryGetPlatformActor(
        HttpContext context,
        out Guid actorUserId,
        out IResult problem)
    {
        var isPlatformAdministrator = bool.TryParse(
            context.Request.Headers[PlatformAdministratorHeader],
            out var parsed) && parsed;

        if (isPlatformAdministrator &&
            TryParseRequiredId(
                context.Request.Headers[UserHeader],
                out actorUserId))
        {
            problem = Results.Empty;
            return true;
        }

        actorUserId = Guid.Empty;
        problem = Results.Problem(
            statusCode: StatusCodes.Status403Forbidden,
            title: "Administração da plataforma necessária",
            detail:
                "O usuário autenticado não é administrador da plataforma.");
        return false;
    }

    private static bool TryGetTenantActor(
        HttpContext context,
        out Guid tenantId,
        out Guid actorUserId,
        out IResult problem)
    {
        if (TryParseRequiredId(
                context.Request.Headers[TenantHeader],
                out tenantId) &&
            TryParseRequiredId(
                context.Request.Headers[UserHeader],
                out actorUserId))
        {
            problem = Results.Empty;
            return true;
        }

        tenantId = Guid.Empty;
        actorUserId = Guid.Empty;
        problem = Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Contexto de tenant inválido",
            detail:
                "O tenant e o usuário autenticados são obrigatórios.");
        return false;
    }

    private static bool TryParseRequiredId(
        string? value,
        out Guid id)
    {
        return Guid.TryParse(value, out id) && id != Guid.Empty;
    }

    private static IResult Conflict(string detail)
    {
        return Results.Problem(
            statusCode: StatusCodes.Status409Conflict,
            title: "Conflito de identidade",
            detail: detail);
    }

    public sealed record CreateTenantRequest(
        string Name,
        string Slug,
        string AdministratorUsername,
        string AdministratorDisplayName,
        string AdministratorEmail,
        string AdministratorPassword);

    public sealed record CreatePlatformAdministratorRequest(
        string Username,
        string DisplayName,
        string Email,
        string Password);

    public sealed record CreateTenantUserRequest(
        string Username,
        string DisplayName,
        string Email,
        string Password,
        string Role);
}

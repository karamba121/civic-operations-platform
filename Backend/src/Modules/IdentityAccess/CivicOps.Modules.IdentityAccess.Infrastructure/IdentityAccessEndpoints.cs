using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CivicOps.Modules.IdentityAccess.Infrastructure;

public static class IdentityAccessEndpoints
{
    public static IEndpointRouteBuilder MapIdentityAccessEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints
            .MapGroup("/api/v1/access")
            .WithTags("Identity & Access");

        group.MapPost(
            "/bootstrap",
            async (
                HttpContext context,
                IdentityAccessOptions options,
                BootstrapTenantAdministratorHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!options.BootstrapEnabled)
                {
                    return Results.Problem(
                        statusCode: StatusCodes.Status403Forbidden,
                        title: "Bootstrap desabilitado",
                        detail:
                            "Habilite explicitamente o bootstrap durante o provisionamento inicial.");
                }

                if (!TryGetContext(
                        context,
                        out var tenantId,
                        out var userId,
                        out var problem))
                {
                    return problem;
                }

                var result = await handler.HandleAsync(
                    tenantId,
                    userId,
                    cancellationToken);

                return Results.Created(
                    $"/api/v1/access/members/{result.UserId}",
                    result);
            })
            .WithName("BootstrapTenantAdministrator")
            .Produces<MembershipResult>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapPut(
            "/members/{targetUserId:guid}",
            async (
                Guid targetUserId,
                SetTenantMemberRoleRequest request,
                HttpContext context,
                SetTenantMemberRoleHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetContext(
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

                var result = await handler.HandleAsync(
                    tenantId,
                    actorUserId,
                    targetUserId,
                    role,
                    cancellationToken);
                return Results.Ok(result);
            })
            .WithName("SetTenantMemberRole")
            .Produces<MembershipResult>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapGet(
            "/members",
            async (
                HttpContext context,
                ListTenantMembersHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetContext(
                        context,
                        out var tenantId,
                        out var actorUserId,
                        out var problem))
                {
                    return problem;
                }

                var result = await handler.HandleAsync(
                    tenantId,
                    actorUserId,
                    cancellationToken);
                return Results.Ok(result);
            })
            .WithName("ListTenantMembers")
            .Produces<IReadOnlyCollection<MembershipResult>>(
                StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        return endpoints;
    }

    private static bool TryGetContext(
        HttpContext context,
        out Guid tenantId,
        out Guid userId,
        out IResult problem)
    {
        if (!Guid.TryParse(
                context.Request.Headers["X-Tenant-Id"],
                out tenantId) ||
            tenantId == Guid.Empty)
        {
            userId = Guid.Empty;
            problem = InvalidHeaderProblem(
                "X-Tenant-Id",
                "Tenant inválido");
            return false;
        }

        if (!Guid.TryParse(
                context.Request.Headers["X-User-Id"],
                out userId) ||
            userId == Guid.Empty)
        {
            problem = InvalidHeaderProblem(
                "X-User-Id",
                "Usuário inválido");
            return false;
        }

        problem = Results.Ok();
        return true;
    }

    private static IResult InvalidHeaderProblem(
        string header,
        string title)
    {
        return Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: title,
            detail: $"Informe um UUID válido no cabeçalho {header}.");
    }

    public sealed record SetTenantMemberRoleRequest(string Role);
}

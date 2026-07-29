using CivicOps.Modules.Requests.Application.CreateRequest;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CivicOps.Modules.Requests.Presentation;

public static class RequestEndpoints
{
    public static IEndpointRouteBuilder MapRequestEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints
            .MapGroup("/api/v1/requests")
            .WithTags("Requests");

        group.MapPost(
                "/",
                async (
                    CreateRequestRequest body,
                    HttpContext httpContext,
                    CreateRequestHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return Results.Problem(
                            statusCode: StatusCodes.Status400BadRequest,
                            title: "Tenant inválido",
                            detail:
                                "Informe um UUID válido no cabeçalho X-Tenant-Id.");
                    }

                    if (!TryGetIdempotencyKey(httpContext, out var idempotencyKey))
                    {
                        return Results.Problem(
                            statusCode: StatusCodes.Status400BadRequest,
                            title: "Chave de idempotência inválida",
                            detail:
                                "Informe o cabeçalho Idempotency-Key com até 128 caracteres.");
                    }

                    var result = await handler.HandleAsync(
                        new CreateRequestCommand(
                            tenantId,
                            idempotencyKey,
                            body.Title,
                            body.Description),
                        cancellationToken);

                    var response = new CreateRequestResponse(
                        result.Id,
                        result.ProtocolNumber,
                        result.Status,
                        result.CreatedAtUtc,
                        result.Version);

                    return Results.Created(
                        $"/api/v1/requests/{result.Id}",
                        response);
                })
            .WithName("CreateRequest")
            .Produces<CreateRequestResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        return endpoints;
    }

    private static bool TryGetTenantId(HttpContext context, out Guid tenantId)
    {
        var value = context.Request.Headers["X-Tenant-Id"].ToString();
        return Guid.TryParse(value, out tenantId) && tenantId != Guid.Empty;
    }

    private static bool TryGetIdempotencyKey(
        HttpContext context,
        out string idempotencyKey)
    {
        idempotencyKey = context.Request.Headers["Idempotency-Key"].ToString().Trim();
        return idempotencyKey.Length is > 0 and <= 128;
    }
}

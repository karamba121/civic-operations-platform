using CivicOps.Modules.Requests.Application;
using CivicOps.Modules.Requests.Application.CreateRequest;
using CivicOps.Modules.Requests.Application.AssignResponsible;
using CivicOps.Modules.Requests.Application.ChangeRequestStatus;
using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.ListRequests;
using CivicOps.Modules.Requests.Domain.Requests;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using CivicOps.Modules.Requests.Presentation.AssignResponsible;
using CivicOps.Modules.Requests.Presentation.ChangeRequestStatus;
using CivicOps.Modules.Requests.Presentation.GetRequestDetails;
using CivicOps.Modules.Requests.Presentation.ListRequests;
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

        group.MapGet(
                "/",
                async (
                    [AsParameters] ListRequestsParameters parameters,
                    HttpContext httpContext,
                    ListRequestsHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    if (!TryParseStatus(parameters.Status, out var status))
                    {
                        return Results.Problem(
                            statusCode: StatusCodes.Status400BadRequest,
                            title: "Situação inválida",
                            detail:
                                $"Valores aceitos: {string.Join(", ", Enum.GetNames<RequestStatus>())}.");
                    }

                    var result = await handler.HandleAsync(
                        new ListRequestsQuery(
                            tenantId,
                            parameters.Page ?? 1,
                            parameters.PageSize ?? 20,
                            parameters.Search,
                            status,
                            parameters.CreatedFromUtc,
                            parameters.CreatedToUtc),
                        cancellationToken);

                    var items = result.Items
                        .Select(item => new RequestListItemResponse(
                            item.Id,
                            item.ProtocolNumber,
                            item.Title,
                            item.Status,
                            item.ResponsibleUserId,
                            item.CreatedAtUtc,
                            item.Version))
                        .ToList();

                    return Results.Ok(
                        new PagedRequestsResponse(
                            items,
                            result.Page,
                            result.PageSize,
                            result.TotalItems,
                            result.TotalPages));
                })
            .WithName("ListRequests")
            .Produces<PagedRequestsResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapGet(
                "/{requestId:guid}",
                async (
                    Guid requestId,
                    HttpContext httpContext,
                    GetRequestDetailsHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    var result = await handler.HandleAsync(
                        new GetRequestDetailsQuery(tenantId, requestId),
                        cancellationToken);

                    if (result is null)
                    {
                        return Results.NotFound();
                    }

                    return Results.Ok(
                        new RequestDetailsResponse(
                            result.Id,
                            result.ProtocolNumber,
                            result.Title,
                            result.Description,
                            result.Status,
                            result.ResponsibleUserId,
                            result.CreatedAtUtc,
                            result.Version));
                })
            .WithName("GetRequestDetails")
            .Produces<RequestDetailsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapPatch(
                "/{requestId:guid}/assignment",
                async (
                    Guid requestId,
                    AssignResponsibleRequest body,
                    HttpContext httpContext,
                    AssignResponsibleHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    var result = await handler.HandleAsync(
                        new AssignResponsibleCommand(
                            tenantId,
                            requestId,
                            body.ResponsibleUserId,
                            body.Version),
                        cancellationToken);

                    return result is null
                        ? Results.NotFound()
                        : Results.Ok(ToMutationResponse(result));
                })
            .WithName("AssignRequestResponsible")
            .Produces<RequestMutationResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapPatch(
                "/{requestId:guid}/status",
                async (
                    Guid requestId,
                    ChangeRequestStatusRequest body,
                    HttpContext httpContext,
                    ChangeRequestStatusHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    if (!TryParseStatus(body.Status, out var status) || status is null)
                    {
                        return Results.Problem(
                            statusCode: StatusCodes.Status400BadRequest,
                            title: "Situação inválida",
                            detail:
                                $"Valores aceitos: {string.Join(", ", Enum.GetNames<RequestStatus>())}.");
                    }

                    var result = await handler.HandleAsync(
                        new ChangeRequestStatusCommand(
                            tenantId,
                            requestId,
                            status.Value,
                            body.Version),
                        cancellationToken);

                    return result is null
                        ? Results.NotFound()
                        : Results.Ok(ToMutationResponse(result));
                })
            .WithName("ChangeRequestStatus")
            .Produces<RequestMutationResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        return endpoints;
    }

    private static RequestMutationResponse ToMutationResponse(
        RequestMutationResult result)
    {
        return new RequestMutationResponse(
            result.Id,
            result.ProtocolNumber,
            result.Status,
            result.ResponsibleUserId,
            result.Version);
    }

    private static IResult InvalidTenantProblem()
    {
        return Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Tenant inválido",
            detail: "Informe um UUID válido no cabeçalho X-Tenant-Id.");
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

    private static bool TryParseStatus(
        string? value,
        out RequestStatus? status)
    {
        status = null;

        if (string.IsNullOrWhiteSpace(value))
        {
            return true;
        }

        var matchingName = Enum
            .GetNames<RequestStatus>()
            .SingleOrDefault(name =>
                string.Equals(name, value.Trim(), StringComparison.OrdinalIgnoreCase));

        if (matchingName is null)
        {
            return false;
        }

        status = Enum.Parse<RequestStatus>(matchingName);
        return true;
    }
}

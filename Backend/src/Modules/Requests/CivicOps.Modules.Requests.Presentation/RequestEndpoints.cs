using CivicOps.Modules.Requests.Application;
using CivicOps.Modules.Requests.Application.AddRequestComment;
using CivicOps.Modules.Requests.Application.CreateRequest;
using CivicOps.Modules.Requests.Application.AssignResponsible;
using CivicOps.Modules.Requests.Application.ChangeRequestStatus;
using CivicOps.Modules.Requests.Application.GetRequestDetails;
using CivicOps.Modules.Requests.Application.GetRequestDashboard;
using CivicOps.Modules.Requests.Application.ListRequests;
using CivicOps.Modules.Requests.Application.ListRequestComments;
using CivicOps.Modules.Requests.Application.ListRequestAudit;
using CivicOps.Modules.Requests.Application.SetRequestDueDate;
using CivicOps.Modules.Requests.Domain.Requests;
using CivicOps.Modules.Requests.Presentation.CreateRequest;
using CivicOps.Modules.Requests.Presentation.AddRequestComment;
using CivicOps.Modules.Requests.Presentation.AssignResponsible;
using CivicOps.Modules.Requests.Presentation.ChangeRequestStatus;
using CivicOps.Modules.Requests.Presentation.GetRequestDetails;
using CivicOps.Modules.Requests.Presentation.GetRequestDashboard;
using CivicOps.Modules.Requests.Presentation.ListRequests;
using CivicOps.Modules.Requests.Presentation.ListRequestComments;
using CivicOps.Modules.Requests.Presentation.ListRequestAudit;
using CivicOps.Modules.Requests.Presentation.SetRequestDueDate;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Text.Json;

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

                    if (!TryGetUserId(httpContext, out var actorUserId))
                    {
                        return InvalidUserProblem();
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
                            actorUserId,
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
                            item.DueDateUtc,
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
                "/dashboard",
                async (
                    HttpContext httpContext,
                    GetRequestDashboardHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    var result = await handler.HandleAsync(
                        tenantId,
                        cancellationToken);
                    var recent = result.Recent
                        .Select(item =>
                            new RequestDashboardRecentItemResponse(
                                item.Id,
                                item.ProtocolNumber,
                                item.Title,
                                item.Status,
                                item.ResponsibleUserId,
                                item.DueDateUtc,
                                item.CreatedAtUtc))
                        .ToArray();

                    return Results.Ok(
                        new RequestDashboardResponse(
                            result.Total,
                            result.Submitted,
                            result.InProgress,
                            result.Completed,
                            result.Cancelled,
                            result.Overdue,
                            result.DueSoon,
                            result.UnassignedActive,
                            recent));
                })
            .WithName("GetRequestDashboard")
            .Produces<RequestDashboardResponse>(StatusCodes.Status200OK)
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
                            result.DueDateUtc,
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

                    if (!TryGetUserId(httpContext, out var actorUserId))
                    {
                        return InvalidUserProblem();
                    }

                    var result = await handler.HandleAsync(
                        new AssignResponsibleCommand(
                            tenantId,
                            requestId,
                            actorUserId,
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
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapPatch(
                "/{requestId:guid}/due-date",
                async (
                    Guid requestId,
                    SetRequestDueDateRequest body,
                    HttpContext httpContext,
                    SetRequestDueDateHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    if (!TryGetUserId(httpContext, out var actorUserId))
                    {
                        return InvalidUserProblem();
                    }

                    var result = await handler.HandleAsync(
                        new SetRequestDueDateCommand(
                            tenantId,
                            requestId,
                            actorUserId,
                            body.DueDateUtc,
                            body.Version),
                        cancellationToken);

                    return result is null
                        ? Results.NotFound()
                        : Results.Ok(ToMutationResponse(result));
                })
            .WithName("SetRequestDueDate")
            .Produces<RequestMutationResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapPost(
                "/{requestId:guid}/comments",
                async (
                    Guid requestId,
                    AddRequestCommentRequest body,
                    HttpContext httpContext,
                    AddRequestCommentHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    if (!TryGetUserId(httpContext, out var actorUserId))
                    {
                        return InvalidUserProblem();
                    }

                    var result = await handler.HandleAsync(
                        new AddRequestCommentCommand(
                            tenantId,
                            requestId,
                            actorUserId,
                            body.Content),
                        cancellationToken);

                    if (result is null)
                    {
                        return Results.NotFound();
                    }

                    var response = new RequestCommentResponse(
                        result.Id,
                        result.RequestId,
                        result.AuthorUserId,
                        result.Content,
                        result.CreatedAtUtc);

                    return Results.Created(
                        $"/api/v1/requests/{requestId}/comments",
                        response);
                })
            .WithName("AddRequestComment")
            .Produces<RequestCommentResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapGet(
                "/{requestId:guid}/comments",
                async (
                    Guid requestId,
                    [AsParameters] ListRequestCommentsParameters parameters,
                    HttpContext httpContext,
                    ListRequestCommentsHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    var result = await handler.HandleAsync(
                        new ListRequestCommentsQuery(
                            tenantId,
                            requestId,
                            parameters.Page ?? 1,
                            parameters.PageSize ?? 20),
                        cancellationToken);

                    if (result is null)
                    {
                        return Results.NotFound();
                    }

                    var items = result.Items
                        .Select(comment => new RequestCommentListItemResponse(
                            comment.Id,
                            comment.AuthorUserId,
                            comment.Content,
                            comment.CreatedAtUtc))
                        .ToList();

                    return Results.Ok(
                        new PagedRequestCommentsResponse(
                            items,
                            result.Page,
                            result.PageSize,
                            result.TotalItems,
                            result.TotalPages));
                })
            .WithName("ListRequestComments")
            .Produces<PagedRequestCommentsResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapGet(
                "/{requestId:guid}/audit",
                async (
                    Guid requestId,
                    [AsParameters] ListRequestAuditParameters parameters,
                    HttpContext httpContext,
                    ListRequestAuditHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetTenantId(httpContext, out var tenantId))
                    {
                        return InvalidTenantProblem();
                    }

                    var result = await handler.HandleAsync(
                        new ListRequestAuditQuery(
                            tenantId,
                            requestId,
                            parameters.Page ?? 1,
                            parameters.PageSize ?? 20),
                        cancellationToken);

                    if (result is null)
                    {
                        return Results.NotFound();
                    }

                    var items = result.Items
                        .Select(record => new RequestAuditListItemResponse(
                            record.Id,
                            record.EventId,
                            record.ActorUserId,
                            record.Action,
                            JsonSerializer.Deserialize<JsonElement>(record.Data),
                            record.OccurredAtUtc))
                        .ToList();

                    return Results.Ok(
                        new PagedRequestAuditResponse(
                            items,
                            result.Page,
                            result.PageSize,
                            result.TotalItems,
                            result.TotalPages));
                })
            .WithName("ListRequestAudit")
            .Produces<PagedRequestAuditResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest);

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

                    if (!TryGetUserId(httpContext, out var actorUserId))
                    {
                        return InvalidUserProblem();
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
                            actorUserId,
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
            result.DueDateUtc,
            result.Version);
    }

    private static IResult InvalidTenantProblem()
    {
        return Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Tenant inválido",
            detail: "Informe um UUID válido no cabeçalho X-Tenant-Id.");
    }

    private static IResult InvalidUserProblem()
    {
        return Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Usuário inválido",
            detail: "Informe um UUID válido no cabeçalho X-User-Id.");
    }

    private static bool TryGetTenantId(HttpContext context, out Guid tenantId)
    {
        var value = context.Request.Headers["X-Tenant-Id"].ToString();
        return Guid.TryParse(value, out tenantId) && tenantId != Guid.Empty;
    }

    private static bool TryGetUserId(HttpContext context, out Guid userId)
    {
        var value = context.Request.Headers["X-User-Id"].ToString();
        return Guid.TryParse(value, out userId) && userId != Guid.Empty;
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

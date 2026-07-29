using CivicOps.Modules.Requests.Application.DownloadRequestAttachment;
using CivicOps.Modules.Requests.Application.ListRequestAttachments;
using CivicOps.Modules.Requests.Application.UploadRequestAttachment;
using CivicOps.Modules.Requests.Presentation.Attachments;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CivicOps.Modules.Requests.Presentation;

public static class RequestAttachmentEndpoints
{
    public static IEndpointRouteBuilder MapRequestAttachmentEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints
            .MapGroup("/api/v1/requests/{requestId:guid}/attachments")
            .WithTags("Request Attachments");

        group.MapPost(
            "/",
            async (
                Guid requestId,
                IFormFile file,
                HttpContext httpContext,
                UploadRequestAttachmentHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetTenantId(httpContext, out var tenantId))
                {
                    return InvalidTenantProblem();
                }

                if (!TryGetUserId(httpContext, out var userId))
                {
                    return InvalidUserProblem();
                }

                await using var content = file.OpenReadStream();
                var result = await handler.HandleAsync(
                    new UploadRequestAttachmentCommand(
                        tenantId,
                        requestId,
                        userId,
                        file.FileName,
                        file.ContentType,
                        content),
                    cancellationToken);

                if (result is null)
                {
                    return Results.NotFound();
                }

                var response = new RequestAttachmentResponse(
                    result.Id,
                    result.UploadedByUserId,
                    result.FileName,
                    result.ContentType,
                    result.SizeBytes,
                    result.Sha256,
                    result.CreatedAtUtc);

                return Results.Created(
            $"/api/v1/requests/{requestId}/attachments/{result.Id}/content",
                    response);
            })
            .DisableAntiforgery()
            .WithName("UploadRequestAttachment")
            .Produces<RequestAttachmentResponse>(
                StatusCodes.Status201Created)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(
                StatusCodes.Status413PayloadTooLarge)
            .ProducesProblem(
                StatusCodes.Status422UnprocessableEntity);

        group.MapGet(
            "/",
            async (
                Guid requestId,
                HttpContext httpContext,
                ListRequestAttachmentsHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetTenantId(httpContext, out var tenantId))
                {
                    return InvalidTenantProblem();
                }

                var result = await handler.HandleAsync(
                    new ListRequestAttachmentsQuery(
                        tenantId,
                        requestId),
                    cancellationToken);

                if (result is null)
                {
                    return Results.NotFound();
                }

                return Results.Ok(result.Select(
                    attachment => new RequestAttachmentResponse(
                        attachment.Id,
                        attachment.UploadedByUserId,
                        attachment.FileName,
                        attachment.ContentType,
                        attachment.SizeBytes,
                        attachment.Sha256,
                        attachment.CreatedAtUtc)));
            })
            .WithName("ListRequestAttachments")
            .Produces<IReadOnlyCollection<RequestAttachmentResponse>>(
                StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapGet(
            "/{attachmentId:guid}/content",
            async (
                Guid requestId,
                Guid attachmentId,
                HttpContext httpContext,
                DownloadRequestAttachmentHandler handler,
                CancellationToken cancellationToken) =>
            {
                if (!TryGetTenantId(httpContext, out var tenantId))
                {
                    return InvalidTenantProblem();
                }

                var result = await handler.HandleAsync(
                    new DownloadRequestAttachmentQuery(
                        tenantId,
                        requestId,
                        attachmentId),
                    cancellationToken);

                return result is null
                    ? Results.NotFound()
                    : Results.File(
                        result.Content,
                        result.ContentType,
                        result.FileName,
                        enableRangeProcessing: true);
            })
            .WithName("DownloadRequestAttachment")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(
                StatusCodes.Status503ServiceUnavailable);

        return endpoints;
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

    private static bool TryGetTenantId(
        HttpContext context,
        out Guid tenantId)
    {
        var value =
            context.Request.Headers["X-Tenant-Id"].ToString();
        return Guid.TryParse(value, out tenantId) &&
            tenantId != Guid.Empty;
    }

    private static bool TryGetUserId(
        HttpContext context,
        out Guid userId)
    {
        var value =
            context.Request.Headers["X-User-Id"].ToString();
        return Guid.TryParse(value, out userId) &&
            userId != Guid.Empty;
    }
}

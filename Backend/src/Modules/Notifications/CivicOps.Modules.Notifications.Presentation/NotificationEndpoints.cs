using CivicOps.Modules.Notifications.Application.ListNotifications;
using CivicOps.Modules.Notifications.Presentation.ListNotifications;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CivicOps.Modules.Notifications.Presentation;

public static class NotificationEndpoints
{
    public static IEndpointRouteBuilder MapNotificationEndpoints(
        this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints
            .MapGroup("/api/v1/notifications")
            .WithTags("Notifications");

        group.MapGet(
                "/",
                async (
                    [AsParameters] ListNotificationsParameters parameters,
                    HttpContext httpContext,
                    ListNotificationsHandler handler,
                    CancellationToken cancellationToken) =>
                {
                    if (!TryGetRequiredHeader(
                            httpContext,
                            "X-Tenant-Id",
                            out var tenantId))
                    {
                        return InvalidHeaderProblem("X-Tenant-Id", "Tenant inválido");
                    }

                    if (!TryGetRequiredHeader(
                            httpContext,
                            "X-User-Id",
                            out var userId))
                    {
                        return InvalidHeaderProblem("X-User-Id", "Usuário inválido");
                    }

                    var result = await handler.HandleAsync(
                        new ListNotificationsQuery(
                            tenantId,
                            userId,
                            parameters.Page ?? 1,
                            parameters.PageSize ?? 20),
                        cancellationToken);
                    var items = result.Items
                        .Select(item => new NotificationListItemResponse(
                            item.Id,
                            item.RequestId,
                            item.ProtocolNumber,
                            item.Type,
                            item.Title,
                            item.Content,
                            item.CreatedAtUtc))
                        .ToList();

                    return Results.Ok(
                        new PagedNotificationsResponse(
                            items,
                            result.Page,
                            result.PageSize,
                            result.TotalItems,
                            result.TotalPages));
                })
            .WithName("ListNotifications")
            .Produces<PagedNotificationsResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        return endpoints;
    }

    private static bool TryGetRequiredHeader(
        HttpContext context,
        string headerName,
        out Guid value)
    {
        var headerValue = context.Request.Headers[headerName].ToString();
        return Guid.TryParse(headerValue, out value) && value != Guid.Empty;
    }

    private static IResult InvalidHeaderProblem(string headerName, string title)
    {
        return Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: title,
            detail: $"Informe um UUID válido no cabeçalho {headerName}.");
    }
}

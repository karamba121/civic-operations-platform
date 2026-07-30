using CivicOps.BuildingBlocks.Domain;
using CivicOps.BuildingBlocks.Observability;
using CivicOps.Api.Authentication;
using CivicOps.Modules.IdentityAccess;
using CivicOps.Modules.IdentityAccess.Infrastructure;
using CivicOps.Modules.Requests.Application;
using CivicOps.Modules.Requests.Application.CreateRequest;
using CivicOps.Modules.Requests.Application.ListRequests;
using CivicOps.Modules.Requests.Domain.Requests;
using CivicOps.Modules.Requests.Infrastructure;
using CivicOps.Modules.Requests.Infrastructure.Caching;
using CivicOps.Modules.Requests.Infrastructure.Outbox;
using CivicOps.Modules.Requests.Presentation;
using CivicOps.Modules.Notifications.Application.ListNotifications;
using CivicOps.Modules.Notifications.Infrastructure;
using CivicOps.Modules.Notifications.Presentation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddCivicOpsAuthentication(builder.Configuration);
builder.Services
    .AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(
        builder.Configuration["OpenTelemetry:ServiceName"]
            ?? "civic-operations-platform"))
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation(options =>
                options.Filter = context =>
                    !context.Request.Path.StartsWithSegments("/health"))
            .AddSource(
                CivicOpsActivitySources.RequestsName,
                CivicOpsActivitySources.NotificationsName);

        if (builder.Configuration.GetValue<bool>(
                "OpenTelemetry:Otlp:Enabled"))
        {
            tracing.AddOtlpExporter(options =>
            {
                var endpoint = builder.Configuration[
                    "OpenTelemetry:Otlp:Endpoint"];

                if (!string.IsNullOrWhiteSpace(endpoint))
                {
                    options.Endpoint = new Uri(endpoint);
                }
            });
        }
    })
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation();
        metrics.AddMeter(RequestDashboardCacheDiagnostics.MeterName);
        metrics.AddMeter(OutboxDiagnostics.MeterName);

        if (builder.Configuration.GetValue<bool>(
                "OpenTelemetry:Otlp:Enabled"))
        {
            metrics.AddOtlpExporter(options =>
            {
                var endpoint = builder.Configuration[
                    "OpenTelemetry:Otlp:Endpoint"];

                if (!string.IsNullOrWhiteSpace(endpoint))
                {
                    options.Endpoint = new Uri(endpoint);
                }
            });
        }
    });
builder.Services.AddExceptionHandler<DomainExceptionHandler>();
builder.Services.AddExceptionHandler<IdempotencyConflictExceptionHandler>();
builder.Services.AddExceptionHandler<RequestQueryValidationExceptionHandler>();
builder.Services.AddExceptionHandler<RequestConcurrencyExceptionHandler>();
builder.Services.AddExceptionHandler<NotificationQueryValidationExceptionHandler>();
builder.Services.AddExceptionHandler<AttachmentContentTooLargeExceptionHandler>();
builder.Services.AddExceptionHandler<AttachmentContentTypeNotAllowedExceptionHandler>();
builder.Services.AddExceptionHandler<AttachmentAccessDeniedExceptionHandler>();
builder.Services.AddExceptionHandler<IdentityAccessDeniedExceptionHandler>();
builder.Services.AddExceptionHandler<TenantBootstrapConflictExceptionHandler>();
builder.Services.AddExceptionHandler<AttachmentContentUnavailableExceptionHandler>();
builder.Services.AddNotificationsModule(builder.Configuration);
builder.Services.AddIdentityAccessModule(builder.Configuration);
builder.Services.AddRequestsModule(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();
app.UseAuthentication();
app.UseCivicOpsClaimsContext();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .AllowAnonymous()
    .WithName("Health");

app.MapRequestEndpoints();
app.MapRequestAttachmentEndpoints();
app.MapNotificationEndpoints();
app.MapIdentityAccessEndpoints();
app.MapPlatformAdministrationEndpoints();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrations"))
{
    await app.Services.ApplyIdentityAccessMigrationsAsync();
    await app.Services.ApplyRequestsMigrationsAsync();
    await app.Services.ApplyNotificationsMigrationsAsync();
}

await app.RunAsync();

internal sealed class DomainExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not DomainException domainException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status422UnprocessableEntity,
                    Title = "Regra de negócio inválida",
                    Detail = domainException.Message
                },
                Exception = exception
            });
    }
}

internal sealed class IdempotencyConflictExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not IdempotencyConflictException conflictException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Conflito de idempotência",
                    Detail = conflictException.Message
                },
                Exception = exception
            });
    }
}

internal sealed class RequestQueryValidationExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not RequestQueryValidationException validationException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Parâmetros de consulta inválidos",
                    Detail = validationException.Message
                },
                Exception = exception
            });
    }
}

internal sealed class RequestConcurrencyExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not RequestConcurrencyException concurrencyException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Conflito de concorrência",
                    Detail = concurrencyException.Message
                },
                Exception = exception
            });
    }
}

internal sealed class NotificationQueryValidationExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not NotificationQueryValidationException validationException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Parâmetros de consulta inválidos",
                    Detail = validationException.Message
                },
                Exception = exception
            });
    }
}

internal sealed class AttachmentContentTooLargeExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not AttachmentContentTooLargeException tooLarge)
        {
            return false;
        }

        httpContext.Response.StatusCode =
            StatusCodes.Status413PayloadTooLarge;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status413PayloadTooLarge,
                    Title = "Anexo muito grande",
                    Detail = tooLarge.Message
                },
                Exception = exception
            });
    }
}

internal sealed class AttachmentContentUnavailableExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not AttachmentContentUnavailableException unavailable)
        {
            return false;
        }

        httpContext.Response.StatusCode =
            StatusCodes.Status503ServiceUnavailable;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status503ServiceUnavailable,
                    Title = "Conteúdo temporariamente indisponível",
                    Detail = unavailable.Message
                },
                Exception = exception
            });
    }
}

internal sealed class AttachmentContentTypeNotAllowedExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not AttachmentContentTypeNotAllowedException notAllowed)
        {
            return false;
        }

        httpContext.Response.StatusCode =
            StatusCodes.Status415UnsupportedMediaType;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status415UnsupportedMediaType,
                    Title = "Tipo de anexo não permitido",
                    Detail = notAllowed.Message
                },
                Exception = exception
            });
    }
}

internal sealed class AttachmentAccessDeniedExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not AttachmentAccessDeniedException denied)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status403Forbidden,
                    Title = "Acesso ao anexo negado",
                    Detail = denied.Message
                },
                Exception = exception
            });
    }
}

internal sealed class IdentityAccessDeniedExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not IdentityAccessDeniedException denied)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status403Forbidden,
                    Title = "Permissão insuficiente",
                    Detail = denied.Message
                },
                Exception = exception
            });
    }
}

internal sealed class TenantBootstrapConflictExceptionHandler(
    IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not TenantBootstrapConflictException conflict)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status409Conflict;

        return await problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = new ProblemDetails
                {
                    Status = StatusCodes.Status409Conflict,
                    Title = "Bootstrap já realizado",
                    Detail = conflict.Message
                },
                Exception = exception
            });
    }
}

public partial class Program;

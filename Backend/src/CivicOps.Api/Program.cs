using CivicOps.BuildingBlocks.Domain;
using CivicOps.Modules.Requests.Application.CreateRequest;
using CivicOps.Modules.Requests.Infrastructure;
using CivicOps.Modules.Requests.Presentation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<DomainExceptionHandler>();
builder.Services.AddExceptionHandler<IdempotencyConflictExceptionHandler>();
builder.Services.AddRequestsModule(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("Health");

app.MapRequestEndpoints();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrations"))
{
    await app.Services.ApplyRequestsMigrationsAsync();
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

public partial class Program;

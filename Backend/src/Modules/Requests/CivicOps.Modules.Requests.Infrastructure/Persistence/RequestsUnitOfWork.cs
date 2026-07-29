using CivicOps.BuildingBlocks.Domain;
using CivicOps.BuildingBlocks.Observability;
using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;
using CivicOps.Modules.Requests.Domain.Requests.Events;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class RequestsUnitOfWork(RequestsDbContext dbContext) : IRequestsUnitOfWork
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> action,
        CancellationToken cancellationToken)
    {
        var executionStrategy = dbContext.Database.CreateExecutionStrategy();

        try
        {
            return await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction =
                    await dbContext.Database.BeginTransactionAsync(cancellationToken);

                var result = await action(cancellationToken);
                var aggregates = dbContext.ChangeTracker
                    .Entries()
                    .Select(entry => entry.Entity)
                    .OfType<AggregateRoot<Guid>>()
                    .Where(aggregate => aggregate.DomainEvents.Count > 0)
                    .ToList();

                AddAuditAndOutboxRecords(aggregates);
                await dbContext.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                foreach (var aggregate in aggregates)
                {
                    aggregate.ClearDomainEvents();
                }

                return result;
            });
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new RequestConcurrencyException();
        }
    }

    private void AddAuditAndOutboxRecords(
        IReadOnlyCollection<AggregateRoot<Guid>> aggregates)
    {
        var domainEvents = aggregates
            .SelectMany(aggregate => aggregate.DomainEvents)
            .Cast<IRequestDomainEvent>();
        var traceContext =
            TraceContextPropagation.CaptureCurrent();

        foreach (var domainEvent in domainEvents)
        {
            var (eventType, auditAction) = GetEventMetadata(domainEvent);
            var payload = JsonSerializer.Serialize(
                domainEvent,
                domainEvent.GetType(),
                SerializerOptions);

            dbContext.RequestAudit.Add(
                RequestAuditRecord.Create(
                    domainEvent.EventId,
                    domainEvent.TenantId,
                    domainEvent.RequestId,
                    domainEvent.ActorUserId,
                    auditAction,
                    payload,
                    domainEvent.OccurredAtUtc));
            dbContext.OutboxMessages.Add(
                OutboxMessage.Create(
                    domainEvent.EventId,
                    domainEvent.TenantId,
                    eventType,
                    payload,
                    domainEvent.OccurredAtUtc,
                    traceContext.TraceParent,
                    traceContext.TraceState,
                    traceContext.Baggage));
        }
    }

    private static (string EventType, string AuditAction) GetEventMetadata(
        IRequestDomainEvent domainEvent)
    {
        return domainEvent switch
        {
            RequestCreatedDomainEvent =>
                ("requests.request-created.v1", "RequestCreated"),
            RequestResponsibleAssignedDomainEvent =>
                ("requests.responsible-assigned.v1", "ResponsibleAssigned"),
            RequestStatusChangedDomainEvent =>
                ("requests.status-changed.v1", "StatusChanged"),
            RequestDueDateChangedDomainEvent =>
                ("requests.due-date-changed.v1", "DueDateChanged"),
            RequestCommentAddedDomainEvent =>
                ("requests.comment-added.v1", "CommentAdded"),
            RequestAttachmentAddedDomainEvent =>
                ("requests.attachment-added.v1", "AttachmentAdded"),
            _ => throw new InvalidOperationException(
                $"Evento de domínio não suportado: {domainEvent.GetType().Name}.")
        };
    }
}

using CivicOps.BuildingBlocks.Domain;

namespace CivicOps.Modules.Requests.Domain.Requests.Events;

public interface IRequestDomainEvent : IDomainEvent
{
    Guid TenantId { get; }

    Guid RequestId { get; }

    Guid ActorUserId { get; }
}

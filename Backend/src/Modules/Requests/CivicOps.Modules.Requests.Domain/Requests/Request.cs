using CivicOps.BuildingBlocks.Domain;
using CivicOps.Modules.Requests.Domain.Requests.Events;

namespace CivicOps.Modules.Requests.Domain.Requests;

public sealed class Request : AggregateRoot<Guid>
{
    private const int TitleMaxLength = 200;
    private const int DescriptionMaxLength = 4_000;

    private Request(
        Guid id,
        Guid tenantId,
        ProtocolNumber protocolNumber,
        string title,
        string description,
        DateTimeOffset createdAtUtc)
        : base(id)
    {
        TenantId = tenantId;
        ProtocolNumber = protocolNumber;
        Title = title;
        Description = description;
        Status = RequestStatus.Submitted;
        CreatedAtUtc = createdAtUtc;
        Version = Guid.NewGuid();
    }

    private Request()
        : base(Guid.Empty)
    {
        ProtocolNumber = null!;
        Title = null!;
        Description = null!;
    }

    public Guid TenantId { get; private set; }

    public ProtocolNumber ProtocolNumber { get; private set; }

    public string Title { get; private set; }

    public string Description { get; private set; }

    public RequestStatus Status { get; private set; }

    public Guid? ResponsibleUserId { get; private set; }

    public DateTimeOffset? DueDateUtc { get; private set; }

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public Guid Version { get; private set; }

    public static Request Create(
        Guid tenantId,
        Guid actorUserId,
        ProtocolNumber protocolNumber,
        string title,
        string description,
        DateTimeOffset createdAtUtc)
    {
        if (tenantId == Guid.Empty)
        {
            throw new DomainException("O tenant é obrigatório.");
        }

        EnsureActor(actorUserId);
        ArgumentNullException.ThrowIfNull(protocolNumber);

        title = RequiredText(title, "O título é obrigatório.", TitleMaxLength);
        description = RequiredText(
            description,
            "A descrição é obrigatória.",
            DescriptionMaxLength);

        if (createdAtUtc.Offset != TimeSpan.Zero)
        {
            throw new DomainException("A data de criação deve estar em UTC.");
        }

        var request = new Request(
            Guid.CreateVersion7(),
            tenantId,
            protocolNumber,
            title,
            description,
            createdAtUtc);

        request.RaiseDomainEvent(
            new RequestCreatedDomainEvent(
                Guid.CreateVersion7(),
                createdAtUtc,
                request.TenantId,
                request.Id,
                actorUserId,
                request.ProtocolNumber.Value,
                request.Status,
                request.Version));

        return request;
    }

    public void AssignResponsible(
        Guid responsibleUserId,
        Guid expectedVersion,
        Guid actorUserId,
        DateTimeOffset occurredAtUtc)
    {
        EnsureExpectedVersion(expectedVersion);
        EnsureActorAndUtc(actorUserId, occurredAtUtc);

        if (responsibleUserId == Guid.Empty)
        {
            throw new DomainException("O responsável é obrigatório.");
        }

        EnsureNotTerminal("atribuir um responsável");

        if (ResponsibleUserId == responsibleUserId)
        {
            return;
        }

        var previousResponsibleUserId = ResponsibleUserId;
        ResponsibleUserId = responsibleUserId;
        Version = Guid.NewGuid();
        RaiseDomainEvent(
            new RequestResponsibleAssignedDomainEvent(
                Guid.CreateVersion7(),
                occurredAtUtc,
                TenantId,
                Id,
                actorUserId,
                ProtocolNumber.Value,
                previousResponsibleUserId,
                responsibleUserId,
                Version));
    }

    public void ChangeStatus(
        RequestStatus newStatus,
        Guid expectedVersion,
        Guid actorUserId,
        DateTimeOffset occurredAtUtc)
    {
        EnsureExpectedVersion(expectedVersion);
        EnsureActorAndUtc(actorUserId, occurredAtUtc);

        if (Status == newStatus)
        {
            return;
        }

        if (!CanTransitionTo(newStatus))
        {
            throw new DomainException(
                $"Não é permitido alterar a situação de {Status} para {newStatus}.");
        }

        var previousStatus = Status;
        Status = newStatus;
        Version = Guid.NewGuid();
        RaiseDomainEvent(
            new RequestStatusChangedDomainEvent(
                Guid.CreateVersion7(),
                occurredAtUtc,
                TenantId,
                Id,
                actorUserId,
                previousStatus,
                Status,
                Version));
    }

    public void SetDueDate(
        DateTimeOffset? dueDateUtc,
        Guid expectedVersion,
        DateTimeOffset currentDateUtc,
        Guid actorUserId)
    {
        EnsureExpectedVersion(expectedVersion);
        EnsureActor(actorUserId);
        EnsureUtc(currentDateUtc, "A data atual deve estar em UTC.");
        EnsureNotTerminal("alterar o prazo");

        if (dueDateUtc is not null)
        {
            EnsureUtc(dueDateUtc.Value, "O prazo deve estar em UTC.");

            if (dueDateUtc <= currentDateUtc)
            {
                throw new DomainException("O prazo deve ser uma data futura.");
            }
        }

        if (DueDateUtc == dueDateUtc)
        {
            return;
        }

        var previousDueDateUtc = DueDateUtc;
        DueDateUtc = dueDateUtc;
        Version = Guid.NewGuid();
        RaiseDomainEvent(
            new RequestDueDateChangedDomainEvent(
                Guid.CreateVersion7(),
                currentDateUtc,
                TenantId,
                Id,
                actorUserId,
                previousDueDateUtc,
                DueDateUtc,
                Version));
    }

    public void RegisterComment(
        Guid commentId,
        Guid actorUserId,
        DateTimeOffset occurredAtUtc)
    {
        if (commentId == Guid.Empty)
        {
            throw new DomainException("O comentário é obrigatório.");
        }

        EnsureActorAndUtc(actorUserId, occurredAtUtc);
        RaiseDomainEvent(
            new RequestCommentAddedDomainEvent(
                Guid.CreateVersion7(),
                occurredAtUtc,
                TenantId,
                Id,
                actorUserId,
                commentId));
    }

    public void RegisterAttachment(
        RequestAttachment attachment,
        Guid actorUserId,
        DateTimeOffset occurredAtUtc)
    {
        ArgumentNullException.ThrowIfNull(attachment);

        if (attachment.TenantId != TenantId ||
            attachment.RequestId != Id)
        {
            throw new DomainException(
                "O anexo não pertence à solicitação.");
        }

        EnsureActorAndUtc(actorUserId, occurredAtUtc);
        RaiseDomainEvent(
            new RequestAttachmentAddedDomainEvent(
                Guid.CreateVersion7(),
                occurredAtUtc,
                TenantId,
                Id,
                actorUserId,
                attachment.Id,
                attachment.FileName,
                attachment.ContentType,
                attachment.SizeBytes,
                attachment.Sha256));
    }

    private bool CanTransitionTo(RequestStatus newStatus)
    {
        return Status switch
        {
            RequestStatus.Submitted =>
                newStatus is RequestStatus.InProgress or RequestStatus.Cancelled,
            RequestStatus.InProgress =>
                newStatus is RequestStatus.Completed or RequestStatus.Cancelled,
            RequestStatus.Completed or RequestStatus.Cancelled => false,
            _ => false
        };
    }

    private void EnsureExpectedVersion(Guid expectedVersion)
    {
        if (expectedVersion == Guid.Empty || Version != expectedVersion)
        {
            throw new RequestConcurrencyException();
        }
    }

    private void EnsureNotTerminal(string operation)
    {
        if (Status is RequestStatus.Completed or RequestStatus.Cancelled)
        {
            throw new DomainException(
                $"Não é possível {operation} em uma solicitação {Status}.");
        }
    }

    private static string RequiredText(string value, string requiredMessage, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException(requiredMessage);
        }

        value = value.Trim();

        if (value.Length > maxLength)
        {
            throw new DomainException($"O valor deve ter no máximo {maxLength} caracteres.");
        }

        return value;
    }

    private static void EnsureUtc(DateTimeOffset value, string message)
    {
        if (value.Offset != TimeSpan.Zero)
        {
            throw new DomainException(message);
        }
    }

    private static void EnsureActorAndUtc(
        Guid actorUserId,
        DateTimeOffset occurredAtUtc)
    {
        EnsureActor(actorUserId);
        EnsureUtc(occurredAtUtc, "A data do evento deve estar em UTC.");
    }

    private static void EnsureActor(Guid actorUserId)
    {
        if (actorUserId == Guid.Empty)
        {
            throw new DomainException("O usuário responsável pela operação é obrigatório.");
        }
    }
}

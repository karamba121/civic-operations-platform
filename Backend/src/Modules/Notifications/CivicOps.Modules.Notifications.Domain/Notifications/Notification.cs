using CivicOps.BuildingBlocks.Domain;

namespace CivicOps.Modules.Notifications.Domain.Notifications;

public sealed class Notification : AggregateRoot<Guid>
{
    private const int TitleMaxLength = 200;
    private const int ContentMaxLength = 2_000;
    private const int ProtocolNumberMaxLength = 32;

    private Notification(
        Guid id,
        Guid sourceMessageId,
        Guid tenantId,
        Guid recipientUserId,
        Guid requestId,
        string protocolNumber,
        NotificationType type,
        string title,
        string content,
        DateTimeOffset createdAtUtc)
        : base(id)
    {
        SourceMessageId = sourceMessageId;
        TenantId = tenantId;
        RecipientUserId = recipientUserId;
        RequestId = requestId;
        ProtocolNumber = protocolNumber;
        Type = type;
        Title = title;
        Content = content;
        CreatedAtUtc = createdAtUtc;
    }

    private Notification()
        : base(Guid.Empty)
    {
        ProtocolNumber = null!;
        Title = null!;
        Content = null!;
    }

    public Guid TenantId { get; private init; }

    public Guid SourceMessageId { get; private init; }

    public Guid RecipientUserId { get; private init; }

    public Guid RequestId { get; private init; }

    public string ProtocolNumber { get; private init; }

    public NotificationType Type { get; private init; }

    public string Title { get; private init; }

    public string Content { get; private init; }

    public DateTimeOffset CreatedAtUtc { get; private init; }

    public static Notification CreateRequestAssigned(
        Guid sourceMessageId,
        Guid tenantId,
        Guid recipientUserId,
        Guid requestId,
        string protocolNumber,
        DateTimeOffset createdAtUtc)
    {
        EnsureRequiredId(sourceMessageId, "A mensagem de origem é obrigatória.");
        EnsureRequiredId(tenantId, "O tenant é obrigatório.");
        EnsureRequiredId(recipientUserId, "O destinatário é obrigatório.");
        EnsureRequiredId(requestId, "A solicitação é obrigatória.");
        protocolNumber = RequiredText(
            protocolNumber,
            "O protocolo é obrigatório.",
            ProtocolNumberMaxLength);

        if (createdAtUtc.Offset != TimeSpan.Zero)
        {
            throw new DomainException("A data da notificação deve estar em UTC.");
        }

        return new Notification(
            Guid.CreateVersion7(),
            sourceMessageId,
            tenantId,
            recipientUserId,
            requestId,
            protocolNumber,
            NotificationType.RequestAssigned,
            RequiredText(
                "Nova solicitação atribuída",
                "O título é obrigatório.",
                TitleMaxLength),
            RequiredText(
                $"A solicitação {protocolNumber} foi atribuída a você.",
                "O conteúdo é obrigatório.",
                ContentMaxLength),
            createdAtUtc);
    }

    private static void EnsureRequiredId(Guid value, string message)
    {
        if (value == Guid.Empty)
        {
            throw new DomainException(message);
        }
    }

    private static string RequiredText(
        string value,
        string message,
        int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException(message);
        }

        value = value.Trim();

        if (value.Length > maxLength)
        {
            throw new DomainException(
                $"O valor deve ter no máximo {maxLength} caracteres.");
        }

        return value;
    }
}

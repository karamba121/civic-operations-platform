using CivicOps.BuildingBlocks.Domain;

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

    public DateTimeOffset CreatedAtUtc { get; private set; }

    public Guid Version { get; private set; }

    public static Request Create(
        Guid tenantId,
        ProtocolNumber protocolNumber,
        string title,
        string description,
        DateTimeOffset createdAtUtc)
    {
        if (tenantId == Guid.Empty)
        {
            throw new DomainException("O tenant é obrigatório.");
        }

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

        return new Request(
            Guid.CreateVersion7(),
            tenantId,
            protocolNumber,
            title,
            description,
            createdAtUtc);
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
}

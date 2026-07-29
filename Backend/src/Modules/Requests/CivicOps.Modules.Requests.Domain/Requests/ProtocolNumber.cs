using CivicOps.BuildingBlocks.Domain;
using System.Globalization;
using System.Text.RegularExpressions;

namespace CivicOps.Modules.Requests.Domain.Requests;

public sealed partial record ProtocolNumber
{
    private ProtocolNumber(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static ProtocolNumber Create(int year, long sequence)
    {
        if (year is < 2000 or > 9999)
        {
            throw new DomainException("O ano do protocolo é inválido.");
        }

        if (sequence <= 0)
        {
            throw new DomainException("A sequência do protocolo deve ser positiva.");
        }

        return new ProtocolNumber(
            string.Create(
                CultureInfo.InvariantCulture,
                $"{year:D4}-{sequence:D6}"));
    }

    public static ProtocolNumber From(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !ProtocolPattern().IsMatch(value))
        {
            throw new DomainException("O número de protocolo é inválido.");
        }

        return new ProtocolNumber(value);
    }

    public override string ToString() => Value;

    [GeneratedRegex(@"^\d{4}-\d{6,}$", RegexOptions.CultureInvariant)]
    private static partial Regex ProtocolPattern();
}

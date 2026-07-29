namespace CivicOps.Modules.IdentityAccess;

public sealed record MembershipResult(
    Guid UserId,
    string Role,
    IReadOnlyCollection<string> Permissions,
    DateTimeOffset UpdatedAtUtc);

namespace CivicOps.Modules.IdentityAccess;

public sealed class TenantBootstrapConflictException()
    : Exception("O tenant já possui uma associação administrativa.");

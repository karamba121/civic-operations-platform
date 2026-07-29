namespace CivicOps.Modules.IdentityAccess;

public sealed class IdentityAccessDeniedException(string permission)
    : Exception($"O usuário não possui a permissão '{permission}'.");

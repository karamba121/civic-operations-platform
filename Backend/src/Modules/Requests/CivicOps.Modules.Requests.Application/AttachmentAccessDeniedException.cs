namespace CivicOps.Modules.Requests.Application;

public sealed class AttachmentAccessDeniedException()
    : Exception("O usuário não possui autorização para acessar os anexos desta solicitação.");

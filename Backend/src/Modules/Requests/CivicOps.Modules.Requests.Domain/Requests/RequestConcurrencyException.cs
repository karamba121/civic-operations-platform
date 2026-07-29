namespace CivicOps.Modules.Requests.Domain.Requests;

public sealed class RequestConcurrencyException()
    : Exception(
        "A solicitação foi alterada por outro usuário. Recarregue os dados e tente novamente.");

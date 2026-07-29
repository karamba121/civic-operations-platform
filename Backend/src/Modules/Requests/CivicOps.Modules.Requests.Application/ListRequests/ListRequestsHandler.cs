using CivicOps.Modules.Requests.Application.Abstractions;

namespace CivicOps.Modules.Requests.Application.ListRequests;

public sealed class ListRequestsHandler(IRequestReadService readService)
{
    private const int MaximumPageSize = 100;
    private const int MaximumPage = 1_000_000;
    private const int MaximumSearchLength = 200;

    public Task<PagedRequestResult> HandleAsync(
        ListRequestsQuery query,
        CancellationToken cancellationToken)
    {
        Validate(query);

        var normalizedQuery = query with
        {
            Search = string.IsNullOrWhiteSpace(query.Search)
                ? null
                : query.Search.Trim(),
            CreatedFromUtc = query.CreatedFromUtc?.ToUniversalTime(),
            CreatedToUtc = query.CreatedToUtc?.ToUniversalTime()
        };

        return readService.ListAsync(normalizedQuery, cancellationToken);
    }

    private static void Validate(ListRequestsQuery query)
    {
        if (query.TenantId == Guid.Empty)
        {
            throw new RequestQueryValidationException("O tenant é obrigatório.");
        }

        if (query.Page < 1)
        {
            throw new RequestQueryValidationException(
                "A página deve ser maior ou igual a 1.");
        }

        if (query.Page > MaximumPage)
        {
            throw new RequestQueryValidationException(
                $"A página deve ser menor ou igual a {MaximumPage}.");
        }

        if (query.PageSize is < 1 or > MaximumPageSize)
        {
            throw new RequestQueryValidationException(
                $"O tamanho da página deve estar entre 1 e {MaximumPageSize}.");
        }

        if (query.Search?.Trim().Length > MaximumSearchLength)
        {
            throw new RequestQueryValidationException(
                $"A busca deve ter no máximo {MaximumSearchLength} caracteres.");
        }

        if (query.CreatedFromUtc > query.CreatedToUtc)
        {
            throw new RequestQueryValidationException(
                "A data inicial não pode ser posterior à data final.");
        }
    }
}

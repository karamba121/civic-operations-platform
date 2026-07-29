using CivicOps.Modules.Requests.Application.ListRequests;

namespace CivicOps.Modules.Requests.Application.ListRequestAudit;

public sealed record ListRequestAuditQuery
{
    public ListRequestAuditQuery(
        Guid tenantId,
        Guid requestId,
        int page,
        int pageSize)
    {
        if (page is < 1 or > 1_000_000)
        {
            throw new RequestQueryValidationException(
                "A página deve estar entre 1 e 1000000.");
        }

        if (pageSize is < 1 or > 100)
        {
            throw new RequestQueryValidationException(
                "O tamanho da página deve estar entre 1 e 100.");
        }

        TenantId = tenantId;
        RequestId = requestId;
        Page = page;
        PageSize = pageSize;
    }

    public Guid TenantId { get; }

    public Guid RequestId { get; }

    public int Page { get; }

    public int PageSize { get; }
}

namespace CivicOps.Modules.Requests.Application.GetRequestDetails;

public sealed record GetRequestDetailsQuery(Guid TenantId, Guid RequestId);

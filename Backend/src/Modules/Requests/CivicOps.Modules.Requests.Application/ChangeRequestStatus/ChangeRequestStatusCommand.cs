using CivicOps.Modules.Requests.Domain.Requests;

namespace CivicOps.Modules.Requests.Application.ChangeRequestStatus;

public sealed record ChangeRequestStatusCommand(
    Guid TenantId,
    Guid RequestId,
    RequestStatus Status,
    Guid ExpectedVersion);

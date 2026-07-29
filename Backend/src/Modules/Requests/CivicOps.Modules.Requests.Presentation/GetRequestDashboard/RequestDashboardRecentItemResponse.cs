namespace CivicOps.Modules.Requests.Presentation.GetRequestDashboard;

public sealed record RequestDashboardRecentItemResponse(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Status,
    Guid? ResponsibleUserId,
    DateTimeOffset? DueDateUtc,
    DateTimeOffset CreatedAtUtc);

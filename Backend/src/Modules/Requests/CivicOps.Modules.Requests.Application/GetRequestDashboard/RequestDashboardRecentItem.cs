namespace CivicOps.Modules.Requests.Application.GetRequestDashboard;

public sealed record RequestDashboardRecentItem(
    Guid Id,
    string ProtocolNumber,
    string Title,
    string Status,
    Guid? ResponsibleUserId,
    DateTimeOffset? DueDateUtc,
    DateTimeOffset CreatedAtUtc);

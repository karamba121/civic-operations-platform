namespace CivicOps.Modules.Requests.Application.GetRequestDashboard;

public sealed record RequestDashboardResult(
    long Total,
    long Submitted,
    long InProgress,
    long Completed,
    long Cancelled,
    long Overdue,
    long DueSoon,
    long UnassignedActive,
    IReadOnlyList<RequestDashboardRecentItem> Recent);

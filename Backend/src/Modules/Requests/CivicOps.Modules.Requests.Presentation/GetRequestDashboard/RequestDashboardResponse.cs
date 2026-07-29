namespace CivicOps.Modules.Requests.Presentation.GetRequestDashboard;

public sealed record RequestDashboardResponse(
    long Total,
    long Submitted,
    long InProgress,
    long Completed,
    long Cancelled,
    long Overdue,
    long DueSoon,
    long UnassignedActive,
    IReadOnlyList<RequestDashboardRecentItemResponse> Recent);

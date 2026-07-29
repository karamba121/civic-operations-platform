using System.Diagnostics;

namespace CivicOps.BuildingBlocks.Observability;

public static class CivicOpsActivitySources
{
    public const string RequestsName = "CivicOps.Requests";
    public const string NotificationsName = "CivicOps.Notifications";

    public static ActivitySource Requests { get; } =
        new(RequestsName);

    public static ActivitySource Notifications { get; } =
        new(NotificationsName);

    public static void RecordException(
        Activity? activity,
        Exception exception)
    {
        if (activity is null)
        {
            return;
        }

        activity.SetStatus(
            ActivityStatusCode.Error,
            exception.Message);
        activity.AddEvent(
            new ActivityEvent(
                "exception",
                tags: new ActivityTagsCollection
                {
                    ["exception.type"] =
                        exception.GetType().FullName,
                    ["exception.message"] = exception.Message,
                    ["exception.stacktrace"] =
                        exception.ToString()
                }));
    }
}

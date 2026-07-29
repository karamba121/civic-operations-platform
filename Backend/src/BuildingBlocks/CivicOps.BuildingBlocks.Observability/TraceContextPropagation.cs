using System.Diagnostics;
using System.Text;

namespace CivicOps.BuildingBlocks.Observability;

public static class TraceContextPropagation
{
    public const string TraceParentHeader = "traceparent";
    public const string TraceStateHeader = "tracestate";
    public const string BaggageHeader = "baggage";
    public const int MaximumTraceContextLength = 512;
    public const int MaximumBaggageLength = 4_096;

    private static readonly DistributedContextPropagator Propagator =
        DistributedContextPropagator.CreateDefaultPropagator();

    public static TraceContext CaptureCurrent() =>
        Capture(Activity.Current);

    public static TraceContext Capture(Activity? activity)
    {
        if (activity is null)
        {
            return TraceContext.Empty;
        }

        var carrier = new Dictionary<string, List<string>>(
            StringComparer.OrdinalIgnoreCase);

        Propagator.Inject(
            activity,
            carrier,
            static (target, name, value) =>
            {
                var headers = target as
                    Dictionary<string, List<string>>
                    ?? throw new InvalidOperationException(
                        "Carrier de propagação inválido.");

                if (!headers.TryGetValue(name, out var values))
                {
                    values = [];
                    headers[name] = values;
                }

                values.Add(value);
            });

        return new TraceContext(
            LimitOrNull(
                GetJoinedValue(carrier, TraceParentHeader),
                MaximumTraceContextLength),
            LimitOrNull(
                GetJoinedValue(carrier, TraceStateHeader),
                MaximumTraceContextLength),
            LimitOrNull(
                GetJoinedValue(carrier, BaggageHeader),
                MaximumBaggageLength));
    }

    public static ActivityContext ExtractParent(
        TraceContext traceContext)
    {
        if (traceContext.IsEmpty)
        {
            return default;
        }

        var carrier = ToCarrier(traceContext);
        Propagator.ExtractTraceIdAndState(
            carrier,
            GetValues,
            out var traceParent,
            out var traceState);

        return ActivityContext.TryParse(
            traceParent,
            traceState,
            isRemote: true,
            out var parent)
            ? parent
            : default;
    }

    public static void ApplyBaggage(
        Activity? activity,
        TraceContext traceContext)
    {
        if (activity is null ||
            string.IsNullOrWhiteSpace(traceContext.Baggage))
        {
            return;
        }

        var carrier = ToCarrier(traceContext);

        foreach (var item in Propagator.ExtractBaggage(
                     carrier,
                     GetValues) ?? [])
        {
            activity.AddBaggage(item.Key, item.Value);
        }
    }

    public static TraceContext Extract(
        IDictionary<string, object?>? headers)
    {
        if (headers is null)
        {
            return TraceContext.Empty;
        }

        return new TraceContext(
            LimitOrNull(
                GetHeader(headers, TraceParentHeader),
                MaximumTraceContextLength),
            LimitOrNull(
                GetHeader(headers, TraceStateHeader),
                MaximumTraceContextLength),
            LimitOrNull(
                GetHeader(headers, BaggageHeader),
                MaximumBaggageLength));
    }

    public static void Inject(
        TraceContext traceContext,
        IDictionary<string, object?> headers)
    {
        SetOrRemove(
            headers,
            TraceParentHeader,
            traceContext.TraceParent);
        SetOrRemove(
            headers,
            TraceStateHeader,
            traceContext.TraceState);
        SetOrRemove(
            headers,
            BaggageHeader,
            traceContext.Baggage);
    }

    private static Dictionary<string, string> ToCarrier(
        TraceContext traceContext)
    {
        var carrier = new Dictionary<string, string>(
            StringComparer.OrdinalIgnoreCase);

        AddIfPresent(
            carrier,
            TraceParentHeader,
            traceContext.TraceParent);
        AddIfPresent(
            carrier,
            TraceStateHeader,
            traceContext.TraceState);
        AddIfPresent(
            carrier,
            BaggageHeader,
            traceContext.Baggage);

        return carrier;
    }

    private static void GetValues(
        object? carrier,
        string name,
        out string? fieldValue,
        out IEnumerable<string>? fieldValues)
    {
        if (carrier is IReadOnlyDictionary<string, string> headers &&
            headers.TryGetValue(name, out var value))
        {
            fieldValue = value;
            fieldValues = null;
            return;
        }

        fieldValue = null;
        fieldValues = null;
    }

    private static string? GetHeader(
        IDictionary<string, object?> headers,
        string name)
    {
        if (!headers.TryGetValue(name, out var value))
        {
            value = headers
                .FirstOrDefault(pair => string.Equals(
                    pair.Key,
                    name,
                    StringComparison.OrdinalIgnoreCase))
                .Value;
        }

        return value switch
        {
            byte[] bytes => Encoding.UTF8.GetString(bytes),
            string text => text,
            _ => value?.ToString()
        };
    }

    private static string? GetJoinedValue(
        IReadOnlyDictionary<string, List<string>> carrier,
        string name)
    {
        return carrier.TryGetValue(name, out var values) &&
               values.Count > 0
            ? string.Join(",", values)
            : null;
    }

    private static void AddIfPresent(
        IDictionary<string, string> carrier,
        string name,
        string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
        {
            carrier[name] = value;
        }
    }

    private static void SetOrRemove(
        IDictionary<string, object?> headers,
        string name,
        string? value)
    {
        var existingNames = headers.Keys
            .Where(key => string.Equals(
                key,
                name,
                StringComparison.OrdinalIgnoreCase))
            .ToArray();

        foreach (var existingName in existingNames)
        {
            headers.Remove(existingName);
        }

        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        headers[name] = value;
    }

    private static string? LimitOrNull(
        string? value,
        int maximumLength)
    {
        return string.IsNullOrWhiteSpace(value) ||
               value.Length > maximumLength
            ? null
            : value;
    }
}

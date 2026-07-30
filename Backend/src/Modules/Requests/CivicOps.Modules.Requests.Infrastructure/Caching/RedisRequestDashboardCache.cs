using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.GetRequestDashboard;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Diagnostics;
using System.Text.Json;

namespace CivicOps.Modules.Requests.Infrastructure.Caching;

internal sealed class RedisRequestDashboardCache(
    IConnectionMultiplexer connection,
    RequestDashboardCacheOptions options,
    ILogger<RedisRequestDashboardCache> logger)
    : IRequestDashboardCache
{
    private const string ContractVersion = "v1";
    private static readonly JsonSerializerOptions SerializerOptions =
        new(JsonSerializerDefaults.Web);

    public async Task<RequestDashboardCacheLookup> GetAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var startedAt = Stopwatch.GetTimestamp();

        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            var database = connection.GetDatabase();
            var generationValue = await database.StringGetAsync(
                GenerationKey(tenantId));
            var generation = generationValue.TryParse(out long parsed)
                ? parsed
                : 0;
            var value = await database.StringGetAsync(
                DashboardKey(tenantId, generation));

            if (value.IsNullOrEmpty)
            {
                RequestDashboardCacheDiagnostics.Misses.Add(1);
                return new RequestDashboardCacheLookup(null, generation);
            }

            var dashboard = JsonSerializer.Deserialize<RequestDashboardResult>(
                (byte[])value!,
                SerializerOptions);
            if (dashboard is null)
            {
                RequestDashboardCacheDiagnostics.Misses.Add(1);
                return new RequestDashboardCacheLookup(null, generation);
            }

            RequestDashboardCacheDiagnostics.Hits.Add(1);
            return new RequestDashboardCacheLookup(dashboard, generation);
        }
        catch (Exception exception)
            when (exception is not OperationCanceledException)
        {
            RecordFailure("read", exception);
            return new RequestDashboardCacheLookup(null, -1);
        }
        finally
        {
            RecordDuration("read", startedAt);
        }
    }

    public async Task SetAsync(
        Guid tenantId,
        long generation,
        RequestDashboardResult dashboard,
        CancellationToken cancellationToken)
    {
        if (generation < 0)
        {
            return;
        }

        var startedAt = Stopwatch.GetTimestamp();

        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            var payload = JsonSerializer.SerializeToUtf8Bytes(
                dashboard,
                SerializerOptions);
            await connection.GetDatabase().StringSetAsync(
                DashboardKey(tenantId, generation),
                payload,
                options.TimeToLive);
        }
        catch (Exception exception)
            when (exception is not OperationCanceledException)
        {
            RecordFailure("write", exception);
        }
        finally
        {
            RecordDuration("write", startedAt);
        }
    }

    public async Task InvalidateAsync(
        Guid tenantId,
        CancellationToken cancellationToken)
    {
        var startedAt = Stopwatch.GetTimestamp();

        try
        {
            cancellationToken.ThrowIfCancellationRequested();
            await connection.GetDatabase().StringIncrementAsync(
                GenerationKey(tenantId));
            RequestDashboardCacheDiagnostics.Invalidations.Add(1);
        }
        catch (Exception exception)
            when (exception is not OperationCanceledException)
        {
            RecordFailure("invalidate", exception);
        }
        finally
        {
            RecordDuration("invalidate", startedAt);
        }
    }

    private static RedisKey GenerationKey(Guid tenantId)
    {
        return $"civicops:requests-dashboard:{ContractVersion}:" +
            $"{tenantId:N}:generation";
    }

    private static RedisKey DashboardKey(Guid tenantId, long generation)
    {
        return $"civicops:requests-dashboard:{ContractVersion}:" +
            $"{tenantId:N}:g{generation}";
    }

    private void RecordFailure(string operation, Exception exception)
    {
        RequestDashboardCacheDiagnostics.Failures.Add(
            1,
            new KeyValuePair<string, object?>("operation", operation));
        logger.LogWarning(
            exception,
            "Redis indisponível durante a operação {CacheOperation}; " +
            "o PostgreSQL continuará atendendo o dashboard.",
            operation);
    }

    private static void RecordDuration(
        string operation,
        long startedAt)
    {
        RequestDashboardCacheDiagnostics.OperationDuration.Record(
            Stopwatch.GetElapsedTime(startedAt).TotalMilliseconds,
            new KeyValuePair<string, object?>("operation", operation));
    }
}

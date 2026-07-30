param(
    [Parameter()]
    [string] $WithoutCacheBaseUrl = "http://localhost:5081",

    [Parameter()]
    [string] $WithCacheBaseUrl = "http://localhost:5082",

    [Parameter()]
    [Guid] $TenantId = "ffffffff-ffff-ffff-ffff-ffffffffcace",

    [Parameter()]
    [ValidateRange(0, 10000)]
    [int] $WarmupRequests = 20,

    [Parameter()]
    [ValidateRange(1, 100000)]
    [int] $MeasuredRequests = 200
)

Add-Type -AssemblyName System.Net.Http

function Measure-Dashboard {
    param(
        [Parameter(Mandatory)]
        [string] $Scenario,

        [Parameter(Mandatory)]
        [string] $BaseUrl
    )

    $client = [System.Net.Http.HttpClient]::new()
    $client.DefaultRequestHeaders.Add("X-Tenant-Id", $TenantId.ToString())

    try {
        $uri = "$($BaseUrl.TrimEnd('/'))/api/v1/requests/dashboard"

        for ($index = 0; $index -lt $WarmupRequests; $index++) {
            $response = $client.GetAsync($uri).GetAwaiter().GetResult()
            $response.EnsureSuccessStatusCode() | Out-Null
            $response.Dispose()
        }

        $samples = [System.Collections.Generic.List[double]]::new()

        for ($index = 0; $index -lt $MeasuredRequests; $index++) {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = $client.GetAsync($uri).GetAwaiter().GetResult()
            $response.EnsureSuccessStatusCode() | Out-Null
            $response.Dispose()
            $stopwatch.Stop()
            $samples.Add($stopwatch.Elapsed.TotalMilliseconds)
        }

        $sorted = @($samples | Sort-Object)

        [pscustomobject]@{
            scenario = $Scenario
            requests = $samples.Count
            mean_ms = [math]::Round(($samples | Measure-Object -Average).Average, 3)
            p50_ms = [math]::Round($sorted[[math]::Floor(($sorted.Count - 1) * 0.50)], 3)
            p95_ms = [math]::Round($sorted[[math]::Floor(($sorted.Count - 1) * 0.95)], 3)
            min_ms = [math]::Round($sorted[0], 3)
            max_ms = [math]::Round($sorted[-1], 3)
        }
    }
    finally {
        $client.Dispose()
    }
}

@(
    Measure-Dashboard -Scenario "postgres-without-cache" -BaseUrl $WithoutCacheBaseUrl
    Measure-Dashboard -Scenario "redis-cache-hit" -BaseUrl $WithCacheBaseUrl
) | ConvertTo-Json

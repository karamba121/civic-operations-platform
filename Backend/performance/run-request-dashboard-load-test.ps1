param(
    [Parameter()]
    [ValidateRange(1, 500)]
    [int] $VirtualUsers = 10,

    [Parameter()]
    [ValidatePattern("^\d+(s|m|h)$")]
    [string] $Duration = "30s",

    [Parameter()]
    [ValidateRange(1024, 65535)]
    [int] $WithoutCachePort = 5081,

    [Parameter()]
    [ValidateRange(1024, 65535)]
    [int] $WithCachePort = 5082,

    [Parameter()]
    [string] $ResultsDirectory,

    [Parameter()]
    [switch] $KeepDataset
)

$ErrorActionPreference = "Stop"

$tenantId = "ffffffff-ffff-ffff-ffff-ffffffffcace"
$postgresContainer = "civic-operations-postgres"
$withoutCacheContainer = "civicops-load-cache-off"
$withCacheContainer = "civicops-load-cache-on"
$dockerNetwork = "civic-operations-platform_default"
$apiImage = "civicops-load-test:local"
$k6Image = "grafana/k6:1.0.0"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$backendDirectory = Join-Path $repositoryRoot "Backend"
$datasetPath = Join-Path $PSScriptRoot "request-dashboard-cache-dataset.sql"
$loadTestPath = Join-Path $PSScriptRoot "request-dashboard-load-test.js"
$ResultsDirectory = if ([string]::IsNullOrWhiteSpace($ResultsDirectory)) {
    Join-Path $PSScriptRoot ".results"
}
else {
    $ResultsDirectory
}
$resolvedResultsDirectory = [System.IO.Path]::GetFullPath($ResultsDirectory)

function Assert-LastExitCode {
    param([Parameter(Mandatory)][string] $Operation)

    if ($LASTEXITCODE -ne 0) {
        throw "$Operation falhou com o código $LASTEXITCODE."
    }
}

function Remove-LoadTestContainers {
    foreach ($container in @($withoutCacheContainer, $withCacheContainer)) {
        $existingContainer = docker ps `
            -a `
            -q `
            --filter "name=^/$container$"

        if (-not [string]::IsNullOrWhiteSpace($existingContainer)) {
            docker rm -f $container | Out-Null
            Assert-LastExitCode "Remoção do container '$container'"
        }
    }
}

function Wait-Dashboard {
    param(
        [Parameter(Mandatory)][int] $Port,
        [Parameter(Mandatory)][string] $Scenario
    )

    $headers = @{ "X-Tenant-Id" = $tenantId }
    $uri = "http://localhost:$Port/api/v1/requests/dashboard"

    for ($attempt = 1; $attempt -le 90; $attempt++) {
        try {
            $response = Invoke-WebRequest `
                -UseBasicParsing `
                -Uri $uri `
                -Headers $headers `
                -TimeoutSec 2

            if ($response.StatusCode -eq 200) {
                return
            }
        }
        catch {
            Start-Sleep -Seconds 1
        }
    }

    throw "A API do cenário '$Scenario' não ficou pronta em 90 segundos."
}

function Invoke-K6 {
    param(
        [Parameter(Mandatory)][string] $Scenario,
        [Parameter(Mandatory)][string] $TargetContainer,
        [Parameter(Mandatory)][string] $SummaryFile
    )

    docker run --rm `
        --network $dockerNetwork `
        -e "BASE_URL=http://$TargetContainer`:8080" `
        -e "TENANT_ID=$tenantId" `
        -e "SCENARIO_NAME=$Scenario" `
        -e "VUS=$VirtualUsers" `
        -e "DURATION=$Duration" `
        -e "SUMMARY_PATH=/results/$SummaryFile" `
        -v "${PSScriptRoot}:/scripts:ro" `
        -v "${resolvedResultsDirectory}:/results" `
        $k6Image `
        run /scripts/$(Split-Path $loadTestPath -Leaf)
    Assert-LastExitCode "Teste k6 '$Scenario'"
}

function Read-Result {
    param(
        [Parameter(Mandatory)][string] $Scenario,
        [Parameter(Mandatory)][string] $SummaryFile
    )

    $summary = Get-Content `
        -Raw `
        (Join-Path $resolvedResultsDirectory $SummaryFile) |
        ConvertFrom-Json
    $durationMetric = $summary.metrics.http_req_duration.values
    $requests = $summary.metrics.http_reqs.values
    $failures = $summary.metrics.http_req_failed.values

    [pscustomobject]@{
        scenario = $Scenario
        virtual_users = $VirtualUsers
        duration = $Duration
        requests = [long] $requests.count
        requests_per_second = [math]::Round($requests.rate, 2)
        mean_ms = [math]::Round($durationMetric.avg, 3)
        p50_ms = [math]::Round($durationMetric.med, 3)
        p95_ms = [math]::Round($durationMetric.'p(95)', 3)
        p99_ms = [math]::Round($durationMetric.'p(99)', 3)
        max_ms = [math]::Round($durationMetric.max, 3)
        error_rate = [math]::Round($failures.rate, 6)
    }
}

New-Item -ItemType Directory -Force $resolvedResultsDirectory | Out-Null

try {
    docker compose `
        --project-directory $repositoryRoot `
        -f (Join-Path $repositoryRoot "compose.yaml") `
        up -d --wait postgres redis
    Assert-LastExitCode "Inicialização do PostgreSQL e Redis"

    docker build -t $apiImage $backendDirectory
    Assert-LastExitCode "Build da API"

    Get-Content -Raw $datasetPath |
        docker exec -i $postgresContainer `
            psql -v ON_ERROR_STOP=1 -U civic_ops -d civic_operations
    Assert-LastExitCode "Criação da massa de teste"

    Remove-LoadTestContainers

    docker run -d `
        --name $withoutCacheContainer `
        --network $dockerNetwork `
        -p "${WithoutCachePort}:8080" `
        -e "ConnectionStrings__Postgres=Host=postgres;Port=5432;Database=civic_operations;Username=civic_ops;Password=civic_ops_dev" `
        -e "DashboardCache__Enabled=false" `
        -e "Database__ApplyMigrations=false" `
        -e "OutboxPublisher__Enabled=false" `
        -e "NotificationsConsumer__Enabled=false" `
        $apiImage |
        Out-Null
    Assert-LastExitCode "Inicialização da API sem cache"

    docker run -d `
        --name $withCacheContainer `
        --network $dockerNetwork `
        -p "${WithCachePort}:8080" `
        -e "ConnectionStrings__Postgres=Host=postgres;Port=5432;Database=civic_operations;Username=civic_ops;Password=civic_ops_dev" `
        -e "ConnectionStrings__Redis=redis:6379,abortConnect=false,connectTimeout=500,asyncTimeout=250,syncTimeout=250" `
        -e "DashboardCache__Enabled=true" `
        -e "Database__ApplyMigrations=false" `
        -e "OutboxPublisher__Enabled=false" `
        -e "NotificationsConsumer__Enabled=false" `
        $apiImage |
        Out-Null
    Assert-LastExitCode "Inicialização da API com cache"

    Wait-Dashboard -Port $WithoutCachePort -Scenario "postgres-without-cache"
    Wait-Dashboard -Port $WithCachePort -Scenario "redis-cache-hit"

    Invoke-K6 `
        -Scenario "postgres-without-cache" `
        -TargetContainer $withoutCacheContainer `
        -SummaryFile "postgres-without-cache.json"
    Invoke-K6 `
        -Scenario "redis-cache-hit" `
        -TargetContainer $withCacheContainer `
        -SummaryFile "redis-cache-hit.json"

    $comparison = @(
        Read-Result `
            -Scenario "postgres-without-cache" `
            -SummaryFile "postgres-without-cache.json"
        Read-Result `
            -Scenario "redis-cache-hit" `
            -SummaryFile "redis-cache-hit.json"
    )
    $comparisonPath = Join-Path $resolvedResultsDirectory "comparison.json"
    $comparison | ConvertTo-Json | Set-Content -Encoding utf8 $comparisonPath
    $comparison | Format-Table -AutoSize
    Write-Host "Resultado salvo em $comparisonPath"
}
finally {
    Remove-LoadTestContainers

    if (-not $KeepDataset) {
        docker exec $postgresContainer `
            psql -U civic_ops -d civic_operations `
            -c "DELETE FROM requests.administrative_requests WHERE tenant_id = '$tenantId';" `
            2>$null |
            Out-Null
    }
}

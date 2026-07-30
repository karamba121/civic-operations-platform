# Objetivos de serviço e alertas

## Escopo

Os primeiros objetivos cobrem
`GET /api/v1/requests/dashboard`, leitura operacional usada para acompanhar o
trabalho do tenant. Eles são objetivos internos iniciais, baseados no teste de
carga local e devem ser revistos com tráfego real.

O PostgreSQL permanece como fonte de verdade e Redis é uma otimização
fail-open. Uma falha isolada do cache não viola disponibilidade enquanto o
fallback responde corretamente.

## Objetivos

| Objetivo | Janela | Meta | Orçamento |
| --- | --- | ---: | ---: |
| Disponibilidade | 30 dias corridos | 99,9% sem respostas 5xx | 0,1%, equivalente a 43 min 12 s |
| Latência | 30 dias corridos | 95% das respostas até 250 ms | 5% das requisições acima de 250 ms |

Respostas 4xx são excluídas do numerador de falhas de disponibilidade porque
representam rejeições válidas do contrato. Elas continuam no denominador e
devem ser analisadas separadamente como qualidade de uso.

### SLI de disponibilidade

```promql
sum(rate(http_server_request_duration_seconds_count{
  http_route="/api/v1/requests/dashboard",
  http_response_status_code!~"5.."
}[30d]))
/
sum(rate(http_server_request_duration_seconds_count{
  http_route="/api/v1/requests/dashboard"
}[30d]))
```

### SLI de latência

```promql
sum(rate(http_server_request_duration_seconds_bucket{
  http_route="/api/v1/requests/dashboard",
  le="0.25"
}[30d]))
/
sum(rate(http_server_request_duration_seconds_count{
  http_route="/api/v1/requests/dashboard"
}[30d]))
```

Produção precisa reter métricas por pelo menos 30 dias. O Prometheus local
retém sete dias porque existe para desenvolvimento e validação das regras.

## Política de alertas

- `critical`: aciona plantão imediatamente e exige confirmação;
- `warning`: cria incidente operacional para investigação em horário de
  atendimento;
- alertas críticos devem ser agrupados por `service` e `alertname`;
- uma notificação resolvida deve ser enviada ao mesmo canal;
- o ambiente de produção deve encaminhar as regras a um Alertmanager ou serviço
  gerenciado; o perfil local mantém os alertas visíveis na interface do
  Prometheus, sem enviar notificações externas.

As regras versionadas estão em
[`observability/rules/civicops-alerts.yaml`](../../observability/rules/civicops-alerts.yaml).

## Runbooks

### CivicOpsApiUnavailable

**Severidade:** critical.

O probe de `/health` falhou continuamente por dois minutos.

1. confirmar se o processo e o container estão ativos;
2. verificar conectividade, reinicializações e esgotamento de CPU ou memória;
3. inspecionar logs e a última implantação;
4. reiniciar ou reverter a versão quando a falha coincidir com implantação;
5. confirmar `probe_success == 1` antes de encerrar.

### CivicOpsDashboardFastErrorBudgetBurn

**Severidade:** critical.

A taxa de 5xx supera 14,4 vezes o orçamento nas janelas de 5 minutos e 1 hora.

1. segmentar erros por status, instância e versão implantada;
2. correlacionar traces com falhas de PostgreSQL, Redis e limites de recursos;
3. verificar migrations, pool de conexões e mudanças recentes;
4. reverter rapidamente quando houver correlação com implantação;
5. acompanhar as duas janelas até a queima voltar ao limite.

### CivicOpsDashboardSlowErrorBudgetBurn

**Severidade:** warning.

A taxa de 5xx supera seis vezes o orçamento nas janelas de 30 minutos e 6
horas.

1. identificar crescimento gradual por instância e tipo de erro;
2. comparar com volume, saturação e mudanças de dependências;
3. abrir ação corretiva antes que a janela rápida seja atingida;
4. revisar o orçamento consumido nos últimos 30 dias.

### CivicOpsDashboardLatencyHigh

**Severidade:** warning.

O p95 do dashboard permanece acima de 250 ms por dez minutos.

1. verificar taxa de hit e falhas do cache;
2. comparar latência do Redis e tempo das consultas PostgreSQL;
3. inspecionar planos, locks, pool de conexões e saturação;
4. correlacionar com aumento de tráfego e invalidações;
5. repetir o teste de carga somente depois de estabilizar o ambiente.

### CivicOpsDashboardCacheFailures

**Severidade:** warning.

Operações Redis falharam e o endpoint está usando fallback para PostgreSQL.

1. verificar saúde, conectividade, memória e evictions do Redis;
2. confirmar nos traces que o PostgreSQL continua respondendo;
3. acompanhar o alerta de latência e o orçamento de erros;
4. escalar para `critical` somente se o fallback também afetar o objetivo.

### CivicOpsDashboardCacheHitRatioLow

**Severidade:** warning.

A taxa de hit ficou abaixo de 80% por 15 minutos, com pelo menos 100 leituras.

1. verificar se TTL, volume de escritas e invalidações explicam a queda;
2. confirmar que as chaves continuam isoladas por tenant e geração;
3. comparar o custo do cache com o ganho observado;
4. ajustar TTL apenas com nova medição e revisão da tolerância a defasagem.

## Execução local

Suba a aplicação, a infraestrutura e o perfil de observabilidade:

```powershell
$env:OTEL_ENABLED = "true"
docker compose --profile observability up -d --build --wait
```

O Prometheus fica em `http://localhost:9090`. O perfil inclui:

- OpenTelemetry Collector recebendo OTLP gRPC/HTTP;
- exporter Prometheus em `http://localhost:8889/metrics`;
- Blackbox Exporter verificando `http://api:8080/health` pela rede Docker;
- Prometheus com regras e retenção local de sete dias.

Para validar a configuração sem iniciar os serviços:

```powershell
docker compose --profile observability config --quiet

docker run --rm --entrypoint promtool `
  -v "${PWD}/observability:/etc/civicops:ro" `
  prom/prometheus:v3.4.1 `
  check config /etc/civicops/prometheus.yaml

docker run --rm --entrypoint promtool `
  -v "${PWD}/observability:/etc/civicops:ro" `
  -w /etc/civicops/tests `
  prom/prometheus:v3.4.1 `
  test rules civicops-alerts.test.yaml

docker run --rm `
  -v "${PWD}/observability/otel-collector.yaml:/etc/otelcol-contrib/config.yaml:ro" `
  otel/opentelemetry-collector-contrib:0.128.0 `
  validate --config=/etc/otelcol-contrib/config.yaml
```

## Revisão

Revisar metas e thresholds depois de 30 dias de tráfego representativo, após
mudança relevante no perfil de uso ou quando o orçamento for consumido sem
impacto percebido. Mudanças de objetivo devem atualizar este documento, regras,
dashboards e política de notificação no mesmo commit.

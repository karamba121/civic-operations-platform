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

## Sinais operacionais da Outbox

O coletor executa uma consulta agregada ao PostgreSQL a cada 15 segundos por
padrão e mantém o último snapshot em memória para observação pelo OpenTelemetry.
Falhas de coleta não interrompem o publicador e preservam o último snapshot.

O worker de retenção remove em lotes somente mensagens processadas expiradas.
Cada ciclo registra evidência estruturada e incrementa contadores de remoção ou
falha; ele não adiciona labels com dados da mensagem.

| Métrica Prometheus | Tipo | Significado |
| --- | --- | --- |
| `civicops_requests_outbox_pending_messages` | gauge | Mensagens ainda não processadas |
| `civicops_requests_outbox_oldest_pending_age_seconds` | gauge | Idade da mensagem pendente mais antiga |
| `civicops_requests_outbox_retrying_messages` | gauge | Pendências com pelo menos uma falha |
| `civicops_requests_outbox_leased_messages` | gauge | Pendências atualmente reivindicadas |
| `civicops_requests_outbox_pending_attempts` | gauge | Soma das tentativas das mensagens pendentes |
| `civicops_requests_outbox_published_messages_total` | counter | Publicações confirmadas e marcadas como processadas |
| `civicops_requests_outbox_publish_failures_total` | counter | Falhas persistidas para nova tentativa |
| `civicops_requests_outbox_lease_expirations_total` | counter | Atualizações recusadas por lease expirado |
| `civicops_requests_outbox_metrics_collection_failures_total` | counter | Falhas da consulta agregada |
| civicops_requests_outbox_retention_removed_messages_total | counter | Mensagens processadas expiradas removidas |
| civicops_requests_outbox_retention_failures_total | counter | Falhas dos ciclos de retenção |

As séries são globais por instância e não possuem labels de tenant, payload,
identificador de mensagem ou exceção. Isso preserva privacidade e limita
cardinalidade. Os gauges devem ser agregados com `max` entre réplicas; counters
devem ser agregados com `sum(rate(...))`.

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

### CivicOpsOutboxBacklogHigh

**Severidade:** warning.

Mais de 100 mensagens permaneceram pendentes por dez minutos.

1. comparar backlog, idade da mais antiga, retries e tentativas pendentes;
2. confirmar que o publicador está habilitado e possui réplicas saudáveis;
3. verificar RabbitMQ, publisher confirms, PostgreSQL e saturação de recursos;
4. identificar o primeiro intervalo de crescimento e correlacionar com deploys;
5. não excluir pendências para encerrar o alerta.

### CivicOpsOutboxOldestPendingHigh

**Severidade:** critical.

A mensagem pendente mais antiga permaneceu acima de cinco minutos por dez
minutos.

1. confirmar execução do worker e conectividade com RabbitMQ;
2. verificar falhas recorrentes e o agendamento de `next_attempt_at_utc`;
3. inspecionar leases presos, pausas do processo e latência do PostgreSQL;
4. restaurar a publicação e acompanhar a idade cair até o valor normal;
5. não marcar mensagens manualmente como processadas.

### CivicOpsOutboxPublishFailures

**Severidade:** warning.

O publicador persistiu falhas e reagendou mensagens.

1. verificar disponibilidade, credenciais e exchange do RabbitMQ;
2. correlacionar os logs pelo identificador da mensagem e pelo trace;
3. confirmar que `attempt_count` cresce e que o backoff evita loop apertado;
4. acompanhar backlog e idade para decidir escalonamento;
5. validar uma publicação confirmada depois da correção.

### CivicOpsOutboxLeaseExpirations

**Severidade:** warning.

O lease expirou antes de a publicação ser confirmada no banco. A entrega
`at-least-once` permite republicação, mas o evento pode chegar duplicado.

1. comparar duração do lease com latência do broker e do PostgreSQL;
2. verificar pausas de CPU, reinicializações e perda de conectividade;
3. confirmar que consumidores continuam idempotentes;
4. aumentar `LockDuration` somente após medir o tempo de publicação;
5. acompanhar duplicidades e estabilização do contador.

### CivicOpsOutboxMetricsCollectionFailures

**Severidade:** warning.

A consulta agregada falhou e os gauges podem representar o último snapshot
bem-sucedido.

1. verificar conectividade e permissões no schema `requests`;
2. confirmar que migrations da Outbox foram aplicadas;
3. inspecionar logs do `OutboxMetricsCollector`;
4. não interpretar gauges estáveis como ausência de crescimento enquanto o
   contador de falhas estiver aumentando;
5. confirmar nova coleta e atualização dos gauges depois da correção.

### CivicOpsOutboxRetentionFailures

**Severidade:** warning.

Um ciclo de retenção falhou e mensagens processadas expiradas permaneceram no
PostgreSQL. A publicação de mensagens pendentes não deve ser afetada.

1. localizar o log do `OutboxRetentionProcessor` e anotar `OperationId`,
   `CutoffUtc` e quantidade removida antes da falha;
2. verificar conectividade, permissões, locks, espaço e latência do PostgreSQL;
3. se a falha persistir, suspender a rotina com
   `OutboxRetention:Enabled=false` e reiniciar a API;
4. não apagar pendências nem alterar `processed_at_utc` manualmente;
5. corrigir a causa, reativar a rotina e confirmar que o contador de remoções
   volta a crescer sem novas falhas;
6. se houver necessidade de recuperar registros já removidos, usar o backup do
   PostgreSQL conforme a política de retenção; a aplicação não desfaz exclusões.
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

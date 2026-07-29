# Planos de execução do dashboard de solicitações

## Objetivo

Definir índices para o dashboard com evidência de `EXPLAIN ANALYZE`, sem criar
índices para consultas que já possuem um plano adequado.

## Ambiente e dataset

- PostgreSQL 17 em `postgres:17-alpine`;
- execução local via Docker Desktop;
- 500.000 solicitações sintéticas;
- 20 tenants com 25.000 registros cada;
- distribuição uniforme entre `Submitted`, `InProgress`, `Completed` e
  `Cancelled`;
- prazos nulos e distribuídos entre 30 dias antes e 30 dias depois da data de
  referência;
- responsáveis distribuídos entre nulo e 500 identificadores;
- script:
  [`Backend/performance/request-dashboard-index-analysis.sql`](../../Backend/performance/request-dashboard-index-analysis.sql).

Os tempos servem para comparar os planos neste ambiente. Não representam
objetivos de serviço nem substituem os testes de carga do roadmap.

O script executa `VACUUM (ANALYZE)` após a carga para tornar a visibility map
determinística. Sem essa etapa, a escolha de index-only scan dependeria da
execução assíncrona do autovacuum.

## Resultado

| Consulta | Plano | Tempo | Blocos compartilhados | Linhas descartadas |
| --- | --- | ---: | ---: | ---: |
| Métricas ativas, antes | bitmap heap scan | 13,98 ms | 8.170 | 12.500 |
| Métricas ativas, depois | index-only scan | 3,73 ms | 87 | 0 |
| Totais por situação | index-only scan | 6,50 ms | 182 | 0 |
| Cinco itens recentes | index scan + incremental sort | 0,10 ms | 6 | 0 |

O índice parcial reduziu o tempo observado da agregação operacional em
aproximadamente 73% e os blocos acessados em aproximadamente 99%. O plano
posterior teve `Heap Fetches: 0`.

## Decisão

Substituir `ix_administrative_requests_tenant_due_date` por:

```sql
CREATE INDEX ix_administrative_requests_tenant_active_due_date
    ON requests.administrative_requests (tenant_id, due_date_utc)
    INCLUDE (responsible_user_id)
    WHERE status = 'Submitted' OR status = 'InProgress';
```

O dashboard passa a executar:

1. totais agrupados por situação, usando
   `ix_administrative_requests_tenant_status_created_at`;
2. métricas de prazo e atribuição apenas para solicitações ativas, usando o
   novo índice parcial;
3. cinco itens recentes, usando
   `ix_administrative_requests_tenant_created_at`.

## Trade-offs

- no dataset, o índice geral de prazo ocupou 3.680 KiB e o parcial com
  `responsible_user_id` incluído ocupou 13 MiB;
- o índice parcial contém somente solicitações ativas, mas cada entrada é maior
  para permitir index-only scan;
- transições para situação terminal removem a entrada do índice;
- escritas ativas pagam a manutenção do índice;
- não foi criado índice cobrindo título e demais campos dos itens recentes:
  buscar cinco linhas em `0,10 ms` não justifica ampliar significativamente o
  custo de escrita e armazenamento.

## Reprodução

Com PostgreSQL local disponível:

```powershell
Get-Content Backend/performance/request-dashboard-index-analysis.sql |
  docker exec -i civic-operations-postgres `
    psql -U civic_ops -d civic_operations
```

O script trabalha somente no schema temporário `index_benchmark` e o remove ao
final.

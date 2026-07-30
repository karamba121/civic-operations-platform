# Cache medido do dashboard de solicitações

## Objetivo

Verificar se um cache distribuído reduz de forma relevante a latência do
dashboard antes de introduzir Redis no caminho de leitura.

## Ambiente e dataset

- API ASP.NET Core em `mcr.microsoft.com/dotnet/sdk:10.0`;
- PostgreSQL 17 e Redis 8 em containers locais no Docker Desktop;
- uma instância da API com cache desabilitado e outra com cache Redis;
- 100.000 solicitações sintéticas de um único tenant;
- distribuição uniforme entre `Submitted`, `InProgress`, `Completed` e
  `Cancelled`;
- prazos, responsáveis e datas de criação distribuídos deterministicamente;
- 20 requisições de aquecimento e 200 requisições sequenciais medidas por
  cenário.

A massa é criada por
[`request-dashboard-cache-dataset.sql`](../../Backend/performance/request-dashboard-cache-dataset.sql)
e a medição HTTP é executada por
[`request-dashboard-cache-benchmark.ps1`](../../Backend/performance/request-dashboard-cache-benchmark.ps1).
Os números abaixo são evidência comparativa deste ambiente, não objetivos de
serviço.

## Resultado

| Cenário | Média | p50 | p95 | Mínimo | Máximo |
| --- | ---: | ---: | ---: | ---: | ---: |
| PostgreSQL sem cache | 45,174 ms | 34,390 ms | 91,251 ms | 22,864 ms | 458,359 ms |
| Hit no Redis | 2,045 ms | 1,996 ms | 2,464 ms | 1,599 ms | 4,524 ms |

O cache reduziu a média em aproximadamente 95,5% (22 vezes) e o p95 em
aproximadamente 97,3% (37 vezes).

## Decisão

Adotar cache-aside somente no dashboard:

- chave isolada por tenant, versão de contrato e geração;
- TTL de 30 segundos;
- invalidação após commits que criam ou alteram situação, responsável ou prazo;
- incremento de geração para impedir que uma leitura concorrente republique
  dados anteriores à invalidação;
- fallback para PostgreSQL quando Redis estiver indisponível;
- métricas de hit, miss, falha, invalidação e duração das operações.

O PostgreSQL permanece como fonte de verdade. O cache não participa da
transação de escrita e uma falha de invalidação pode manter dados por, no
máximo, o TTL configurado.

## Reprodução

Com os serviços do Compose e as duas instâncias da API disponíveis:

```powershell
Get-Content Backend/performance/request-dashboard-cache-dataset.sql |
  docker exec -i civic-operations-postgres `
    psql -U civic_ops -d civic_operations

powershell -ExecutionPolicy Bypass `
  -File Backend/performance/request-dashboard-cache-benchmark.ps1
```

As URLs, o tenant, o aquecimento e o número de amostras podem ser alterados
pelos parâmetros do script.

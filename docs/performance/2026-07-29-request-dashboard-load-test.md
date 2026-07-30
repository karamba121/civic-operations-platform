# Teste de carga do dashboard de solicitações

## Objetivo

Medir latência, throughput e erros do dashboard sob concorrência controlada,
comparando a mesma API e o mesmo dataset com o cache Redis desabilitado e
habilitado.

## Ambiente

- host: Intel Core i3-9100F, 4 núcleos e 4 processadores lógicos, 15,9 GiB de
  memória;
- Docker Desktop 29.6.1: 4 CPUs e 7,725 GiB de memória disponíveis;
- API .NET 10 publicada em `Release`;
- PostgreSQL 17 e Redis 8;
- k6 1.0.0 executado em container;
- cliente, APIs, PostgreSQL e Redis no mesmo host e na mesma rede Docker.

Os números caracterizam somente este ambiente local. Eles não são objetivos de
serviço nem estimativas diretas de capacidade de produção.

## Dataset e perfil

- 100.000 solicitações sintéticas de um único tenant;
- distribuição uniforme entre as quatro situações;
- prazos, responsáveis e datas distribuídos deterministicamente;
- duas instâncias construídas a partir da mesma imagem da API;
- 10 usuários virtuais em modelo fechado, executando continuamente por 30
  segundos em cada cenário;
- cenários executados sequencialmente para evitar competição entre as APIs;
- corpo das respostas descartado pelo cliente de carga;
- verificações de status HTTP executadas em todas as iterações.

A massa vem de
[`request-dashboard-cache-dataset.sql`](../../Backend/performance/request-dashboard-cache-dataset.sql),
e o cenário está em
[`request-dashboard-load-test.js`](../../Backend/performance/request-dashboard-load-test.js).

## Limites de aprovação

- respostas HTTP válidas acima de 99%;
- taxa de falhas HTTP abaixo de 1%;
- p95 abaixo de 250 ms.

Os dois cenários atenderam aos três limites.

## Resultado

| Cenário | Requisições | Throughput | Média | p50 | p95 | p99 | Máximo | Erros |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| PostgreSQL sem cache | 2.815 | 93,70 req/s | 106,425 ms | 98,059 ms | 200,170 ms | 267,064 ms | 603,814 ms | 0% |
| Hit no Redis | 131.576 | 4.386,26 req/s | 2,182 ms | 1,545 ms | 5,403 ms | 11,249 ms | 749,871 ms | 0% |

Com cache, o throughput observado foi aproximadamente 46,8 vezes maior, a
média foi 48,8 vezes menor e o p95 foi 37 vezes menor. O máximo do cenário com
Redis contém um outlier isolado; p95 e p99 permaneceram em 5,403 ms e
11,249 ms.

## Reprodução

Na raiz do repositório:

```powershell
powershell -ExecutionPolicy Bypass `
  -File Backend/performance/run-request-dashboard-load-test.ps1
```

O orquestrador:

1. inicia PostgreSQL e Redis;
2. constrói uma imagem `Release` da API;
3. cria a massa determinística;
4. inicia as instâncias com e sem cache;
5. executa os cenários k6 sequencialmente;
6. grava os resumos em `Backend/performance/.results`;
7. remove containers e registros temporários mesmo quando ocorre falha.

Usuários virtuais e duração são configuráveis:

```powershell
Backend/performance/run-request-dashboard-load-test.ps1 `
  -VirtualUsers 25 `
  -Duration 2m
```

Use `-KeepDataset` somente quando precisar inspecionar a massa após o teste.

## Limitações

- o modelo fechado mede a vazão alcançada por um número fixo de usuários; não
  comprova comportamento diante de uma taxa externa fixa;
- cliente e servidores compartilham recursos do mesmo host;
- o cenário cobre a leitura mais acessada do dashboard, não o conjunto completo
  de endpoints nem uma mistura de escritas;
- testes de capacidade em ambiente semelhante à produção continuam necessários
  antes de definir objetivos de serviço.

# ADR-011: Cache medido para o dashboard de solicitações

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

O dashboard combina totais, métricas operacionais e itens recentes. Os índices
reduzem o custo de cada consulta, mas acessos repetidos ainda recalculam a mesma
projeção. O roadmap permite cache somente quando houver ganho medido e exige
preservar isolamento por tenant e comportamento previsível durante falhas.

## Decisão

- usar Redis com padrão cache-aside apenas para o dashboard;
- incluir versão do contrato, tenant e geração na chave;
- aplicar TTL padrão de 30 segundos, configurável entre 1 segundo e 10 minutos;
- incrementar a geração após o commit de toda escrita que muda o dashboard;
- tratar falhas do Redis como cache miss e continuar pelo PostgreSQL;
- publicar métricas de hit, miss, falha, invalidação e duração;
- manter o PostgreSQL como fonte de verdade.

A geração evita a corrida em que uma leitura iniciada antes de uma escrita
termina depois da invalidação e recoloca uma projeção antiga na chave corrente.
A evidência está no
[relatório do benchmark](../performance/2026-07-29-request-dashboard-cache.md).

## Consequências

- hits deixam de executar as três consultas do dashboard;
- escritas fazem uma operação adicional de invalidação depois do commit;
- Redis indisponível aumenta a latência, mas não indisponibiliza o endpoint;
- falha de invalidação pode servir uma projeção antiga até o TTL expirar;
- cada tenant possui geração e entradas independentes;
- mudanças incompatíveis no contrato exigem nova versão de chave.

## Critério de revisão

Reavaliar o TTL e a permanência do cache quando a taxa de hit for baixa, a
defasagem tolerável mudar, o custo de invalidação superar o ganho observado ou
as métricas mostrarem pressão relevante sobre Redis.

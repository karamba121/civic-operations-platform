# ADR-009: Projeções de leitura para o dashboard de solicitações

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

O início da etapa de performance precisa oferecer uma visão operacional útil
sem carregar agregados completos nem introduzir antecipadamente cache, tabela
de projeção persistida ou infraestrutura de CQRS separada.

O volume e os planos de execução reais ainda não justificam manter uma segunda
representação dos dados.

## Decisão

Criar `GET /api/v1/requests/dashboard`, isolado por `X-Tenant-Id`, com:

- total de solicitações e totais por situação;
- solicitações ativas atrasadas;
- solicitações ativas com vencimento nos próximos sete dias;
- solicitações ativas sem responsável;
- as cinco solicitações mais recentes.

O resumo é calculado por agregações projetadas no PostgreSQL. Os itens recentes
são selecionados diretamente no DTO de leitura, sem materializar o agregado ou
seu conteúdo descritivo.

As situações `Submitted` e `InProgress` são consideradas ativas. Um prazo
anterior ao instante UTC da consulta é atrasado; um prazo entre esse instante e
sete dias, inclusive, é considerado próximo.

Não será criada uma tabela de projeção persistida neste momento. Índices,
cache e eventual materialização serão decididos pelos próximos itens do
roadmap, com planos de execução e medições reproduzíveis.

## Consequências

- o dashboard exige duas consultas pequenas: uma agregação e uma projeção dos
  cinco itens recentes;
- a resposta permanece consistente com o estado confirmado no PostgreSQL;
- não existe atraso de sincronização nem novo processador assíncrono;
- o custo das agregações cresce com o volume do tenant e deverá ser medido;
- o contrato pode evoluir sem afetar o modelo de escrita.

## Evidências exigidas

- teste contra PostgreSQL real cobrindo os totais e as faixas de prazo;
- isolamento entre tenants;
- ordenação determinística dos itens recentes;
- resposta vazia com todos os totais zerados;
- consulta sem carregamento de descrição ou agregado completo.

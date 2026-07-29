# ADR-010: Índice parcial para métricas operacionais

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

O dashboard precisa contar prazos vencidos, prazos próximos e solicitações sem
responsável. O índice geral `(tenant_id, due_date_utc)` localizava o tenant,
mas ainda exigia acesso ao heap e descartava registros terminais.

Adicionar índices cobrindo todas as projeções aumentaria o custo de escrita e
armazenamento sem benefício demonstrado.

## Decisão

- separar os totais por situação das métricas de solicitações ativas;
- considerar `Submitted` e `InProgress` como situações ativas;
- substituir o índice geral de prazo por um índice parcial em
  `(tenant_id, due_date_utc)`;
- incluir `responsible_user_id` para permitir index-only scan;
- preservar os índices existentes para totais por situação e itens recentes;
- não criar índice cobrindo os campos textuais dos itens recentes.

A evidência e o dataset reproduzível estão no
[relatório de planos de execução](../performance/2026-07-29-request-dashboard-indexes.md).

## Consequências

- a agregação operacional acessa somente entradas ativas;
- o dashboard realiza três consultas especializadas em vez de duas consultas
  mais genéricas;
- o novo índice ocupa mais espaço por entrada devido à coluna incluída;
- solicitações terminais deixam de ocupar o índice;
- futuras mudanças na definição de situação ativa exigem migration e revisão
  do predicado da consulta.

## Critério de revisão

Reavaliar quando planos reais deixarem de usar index-only scan, quando o volume
de situações ativas mudar substancialmente ou quando testes de carga mostrarem
que o custo das três consultas supera o benefício observado.

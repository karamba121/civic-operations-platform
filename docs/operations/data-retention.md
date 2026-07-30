# Retenção de Outbox e auditorias

Esta política define a linha de base técnica do projeto. Prazos legais,
regulatórios ou contratuais prevalecem sobre estes valores e devem ser
configurados por ambiente antes de produção.

## Outbox

- mensagens processadas com sucesso permanecem disponíveis por 30 dias para
  diagnóstico e correlação;
- mensagens pendentes, em processamento ou com falha não são removidas
  automaticamente;
- a limpeza deve ocorrer em lotes pequenos, ordenados por data de
  processamento, para evitar bloqueios prolongados;
- antes da exclusão, métricas devem confirmar que não há crescimento anormal,
  mensagens antigas pendentes ou falhas recorrentes;
- a dead-letter queue segue política própria do broker e exige resolução ou
  arquivamento explícito antes da remoção.

## Auditorias

- `requests.request_audit` e `identity_access.access_audit` têm retenção padrão
  de cinco anos;
- registros sob retenção legal ou investigação não podem ser removidos;
- a expiração deve preservar isolamento por tenant e produzir evidência da
  execução, com período abrangido, quantidade removida e identificador da
  operação, sem copiar dados sensíveis;
- a remoção deve ocorrer em lotes e somente por rotina operacional dedicada;
- mudanças de prazo exigem revisão de segurança, privacidade e requisitos
  legais do ambiente de implantação.

## Operação e evidência

A automação executa a cada hora e remove somente mensagens cujo
`processed_at_utc` é anterior ao período configurado, 30 dias por padrão. Cada
comando exclui no máximo 500 registros, em ordem de processamento, usando
`FOR UPDATE SKIP LOCKED`. Um ciclo processa no máximo 20 lotes e aguarda 100 ms
entre lotes para limitar contenção e carga no PostgreSQL.

Configure por ambiente com:

- `OutboxRetention:Enabled`;
- `OutboxRetention:RetentionPeriod`;
- `OutboxRetention:ExecutionInterval`;
- `OutboxRetention:BatchDelay`;
- `OutboxRetention:BatchSize`;
- `OutboxRetention:MaxBatchesPerCycle`.

Cada ciclo registra `OperationId`, `CutoffUtc` e quantidade removida, sem payload,
tenant ou identificadores de mensagens. Os contadores
`civicops_requests_outbox_retention_removed_messages_total` e
`civicops_requests_outbox_retention_failures_total` fornecem a evidência
agregada da rotina.

### Suspensão, retomada e recuperação

1. para suspender novos ciclos, defina `OutboxRetention:Enabled=false` e
   reinicie a API; isso não altera mensagens existentes;
2. não execute exclusões manuais enquanto investiga uma falha;
3. restaure conectividade, permissões ou capacidade do PostgreSQL e valide que
   pendências continuam sendo publicadas normalmente;
4. reative a configuração e reinicie a API; a rotina é idempotente e retomará
   do próximo lote expirado;
5. acompanhe o contador de remoções, o alerta de falha e os logs pelo
   `OperationId`; se o limite por ciclo for atingido, os lotes restantes serão
   processados em execuções posteriores;
6. para recuperar evidência, correlacione logs estruturados e métricas. O
   conteúdo removido não é restaurável pela aplicação e depende do backup do
   PostgreSQL quando houver obrigação de recuperação.

Os testes automatizados comprovam que mensagens processadas expiradas são
removidas e que mensagens recentes, pendentes ou com falha são preservadas.
Retenção legal de auditorias permanece fora desta rotina dedicada à Outbox.
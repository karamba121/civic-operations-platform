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

A automação ainda não está implementada. Para considerar este item concluído,
o projeto deve fornecer:

- configuração validada dos prazos por ambiente;
- rotina idempotente de expiração com execução em lotes;
- testes que preservem mensagens não processadas e registros sob retenção
  legal;
- métricas de quantidade, idade do registro mais antigo, remoções e falhas;
- procedimento documentado de suspensão, retomada e recuperação.

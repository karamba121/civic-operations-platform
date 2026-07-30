# ADR-008: Auditoria de leitura e alteração de dados sensíveis

- **Status:** aceito
- **Data:** 2026-07-29
- **Política operacional:** [retenção de Outbox e auditorias](../operations/data-retention.md)

## Contexto

A trilha de auditoria de `Requests` já registra mutações do agregado e as
correlaciona com eventos da Outbox. Leituras de anexos e operações de
administração de acesso, porém, não produzem eventos de domínio e ainda assim
precisam deixar evidência de quem acessou ou alterou dados sensíveis.

Publicar eventos de integração para toda leitura aumentaria volume e
acoplamento sem representar uma mudança de estado relevante para outros
módulos.

## Decisão

Cada módulo registra sua própria auditoria no schema sob sua autoridade:

- `Requests` registra listagem de metadados e download de anexos em
  `requests.request_audit`;
- `IdentityAccess` registra bootstrap, concessão ou alteração de papel e
  listagem de membros em `identity_access.access_audit`;
- tentativas negadas não são registradas como acesso bem-sucedido;
- registros contêm tenant, ator, alvo quando aplicável, ação, instante UTC e
  metadados mínimos em JSON;
- nomes, conteúdo, hash do arquivo e outros dados sensíveis não são copiados
  para a auditoria;
- leituras auditadas falham fechadas: se o registro não puder ser persistido,
  os dados não são retornados;
- alterações de acesso e seu registro de auditoria participam da mesma
  transação PostgreSQL;
- auditorias de leitura não geram mensagens na Outbox.

Os registros seguem a política de retenção operacional, com prazo padrão de
cinco anos, suporte a retenção legal e expiração em lotes auditáveis. A rotina
de expiração não faz parte desta ADR e permanece como trabalho operacional
pendente.

As ações iniciais são:

- `AttachmentMetadataListed`;
- `AttachmentDownloaded`;
- `TenantAdministratorBootstrapped`;
- `TenantMemberRoleSet`;
- `TenantMembersListed`.

## Consequências

- consultas sensíveis passam a ser rastreáveis por tenant e ator;
- alterações administrativas não podem ser confirmadas sem a respectiva
  auditoria;
- a trilha cresce também com leituras e precisará de política de retenção;
- falha do banco impede o acesso ao dado sensível;
- tentativas negadas permanecem responsabilidade de logs e métricas de
  segurança, evitando confundi-las com acessos realizados.

## Evidências exigidas

- listagem e download autorizados criam um registro cada;
- acesso negado ou isolado por tenant não cria auditoria de sucesso;
- bootstrap concorrente produz um administrador e um registro;
- concessões de papel bem-sucedidas e listagem de membros são auditadas;
- operações rejeitadas não deixam registros de alteração;
- payloads de auditoria não contêm conteúdo ou nome de arquivo.

**Rastreabilidade:** auditoria de anexos e suas respostas negativas estão
cobertas por
[RequestAttachmentEndpointTests](../../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/RequestAttachmentEndpointTests.cs);
auditoria de mutações e isolamento por tenant por
[AuditAndOutboxEndpointTests](../../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/AuditAndOutboxEndpointTests.cs).
A automação de retenção permanece pendente no [roadmap](../roadmap.md).

# Roadmap orientado a evidências

O roadmap prioriza fatias verticais executáveis. Uma etapa só é considerada
concluída quando comportamento, testes e operação local podem ser demonstrados.

## 1. Fundação

- [x] reorganizar a solução .NET e remover o endpoint de exemplo;
- [x] criar composição Docker para aplicação, PostgreSQL, RabbitMQ, Redis e
  observabilidade;
- [x] padronizar Problem Details, validação, logs e correlação de traces;
- [x] configurar testes unitários e de integração;
- [x] validar fronteiras dos módulos com testes de arquitetura;
- [x] criar CI para backend, frontend, validação das regras Prometheus e
  construção e publicação das imagens Docker no Docker Hub.

**Evidência atual:** os comandos estão documentados no
[README do backend](../Backend/README.md) e a composição local em
[compose.yaml](../compose.yaml) e o CI versionado em
[`ci-dockerhub.yml`](../.github/workflows/ci-dockerhub.yml). As fronteiras
são verificadas pelos nove testes do
[`CivicOps.ArchitectureTests`](../Backend/tests/CivicOps.ArchitectureTests),
incluídos na solução e no mesmo CI. O workflow remoto também publicou as
imagens do backend e do frontend no Docker Hub.

## 2. Primeira fatia vertical: solicitações

- [x] criar solicitação com idempotência e gerar protocolo por tenant;
- [x] listar, filtrar e consultar detalhes;
- [x] atribuir responsável e alterar situação;
- [x] registrar comentário e prazo;
- [x] implementar concorrência otimista;
- [x] registrar auditoria e evento na Outbox.

**Evidência atual:** fluxo executável pela API, com
[testes de integração](../Backend/tests/CivicOps.Modules.Requests.IntegrationTests)
contra PostgreSQL real cobrindo isolamento entre tenants e conflito
concorrente. A interface administrativa será entregue item a item na etapa 7.

## 3. Integração assíncrona

- [x] publicar eventos da Outbox no RabbitMQ;
- [x] processar notificações de maneira idempotente;
- [x] aplicar retry, backoff e dead letter;
- [x] propagar contexto de observabilidade.

**Evidência:** publicação e propagação de trace em
[OutboxRabbitMqPublishingTests](../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/OutboxRabbitMqPublishingTests.cs);
idempotência, indisponibilidade, retry e DLQ em
[NotificationIdempotencyTests](../Backend/tests/CivicOps.Modules.Notifications.IntegrationTests/NotificationIdempotencyTests.cs).

## 4. Documentos e segurança

- [x] armazenar metadados e conteúdo fora do banco;
- [x] validar tamanho, tipo e autorização;
- [x] implementar papéis e permissões por tenant;
- [x] auditar leitura e alteração de dados sensíveis.

**Evidência:** autorização negativa, isolamento de tenant e ciclo de vida do
anexo estão cobertos por
[RequestAttachmentEndpointTests](../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/RequestAttachmentEndpointTests.cs).

## 5. Performance e operação

- [x] criar dashboard e consultas projetadas;
- [x] definir índices a partir de planos de execução;
- [x] introduzir cache apenas onde houver ganho medido;
- [x] executar testes de carga reproduzíveis;
- [x] documentar objetivos de serviço e alertas.

**Evidência:** relatórios versionados de
[carga](performance/2026-07-29-request-dashboard-load-test.md),
[índices](performance/2026-07-29-request-dashboard-indexes.md) e
[cache](performance/2026-07-29-request-dashboard-cache.md), além dos
[objetivos de serviço e alertas](operations/service-objectives-and-alerts.md).

## 6. Governança e robustez pré-frontend

As pendências da [Fundação](#1-fundação) — testes de arquitetura e CI —
foram concluídas. Permanecem nesta etapa os itens operacionais abaixo.

- [x] transformar a fundação em checklist e corrigir a evidência da interface
  para refletir somente a integração realmente entregue;
- [x] relacionar as ADRs complementares e ligar evidências aos testes e
  relatórios existentes;
- [x] definir a [política de retenção](operations/data-retention.md) para Outbox
  e auditorias;
- [x] publicar métricas de idade, quantidade, tentativas e falhas da Outbox;
- [x] automatizar retenção em lotes e recuperação segura da Outbox, com testes e
  procedimento operacional.

**Evidência atual:** testes de arquitetura e workflow estão executáveis; as
métricas da Outbox possuem teste unitário, consulta real no PostgreSQL e seis
alertas validados pelo `promtool`. A retenção possui teste de unidade para
lotes, limite e falhas, teste PostgreSQL que preserva mensagens recentes e não
processadas e procedimento operacional de suspensão, retomada e recuperação.

## 7. Administração da plataforma multi-tenant

- [x] distinguir administrador global de administrador de tenant;
- [x] criar catálogo persistente de tenants e usuários gerenciados;
- [x] criar o administrador global local no primeiro startup;
- [x] provisionar identidades no Keycloak sem persistir senhas;
- [x] criar um administrador inicial junto com cada tenant;
- [x] permitir que o administrador do tenant crie usuários somente no próprio
  tenant;
- [x] separar o painel global do workspace operacional após o login;
- [x] auditar criação de tenants e administradores globais;
- [x] cobrir o fluxo vertical e a autorização negativa com PostgreSQL real.

**Evidência:** decisão em
[ADR-013](adr/013-platform-and-tenant-administration.md), migration do módulo
IdentityAccess, teste
[PlatformAdministrationEndpointTests](../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/PlatformAdministrationEndpointTests.cs)
e clientes e painéis Angular separados por claim autenticada.

## 8. Painel administrativo Angular

O TailAdmin fornece somente a base visual. Cada item abaixo deve entregar uma
fatia navegável, integrada à API e coberta por testes antes de ser marcado como
concluído.

- [x] adaptar o shell do TailAdmin ao domínio cívico, removendo rotas, páginas,
  dados demonstrativos e dependências sem uso;
- [x] criar configuração por ambiente, proxy `/api`, cliente HTTP tipado,
  tratamento de Problem Details e contexto provisório de tenant e usuário;
- [x] implementar dashboard operacional com totais, prazos, itens recentes,
  estados de carregamento, vazio, erro e atualização;
- [x] implementar listagem de solicitações com busca, filtros, paginação e
  navegação para o detalhe;
- [x] implementar criação idempotente e detalhe da solicitação com protocolo,
  situação, responsável, prazo, comentários e auditoria;
- [x] implementar atribuição, transição de situação e alteração de prazo com
  tratamento de concorrência otimista;
- [x] implementar comentários e anexos, incluindo upload, validações, listagem,
  download e respostas `403`, `413` e `415`;
- [x] implementar central de notificações e administração de membros, papéis e
  permissões por tenant;
- [x] substituir os cabeçalhos provisórios por identidade autenticada e obter
  tenant e usuário de claims confiáveis;
- [ ] cobrir os fluxos com testes unitários, de componentes e end-to-end,
  incluindo autorização negativa, acessibilidade e regressão responsiva;
- [x] definir budgets de bundle, eliminar vulnerabilidades de produção e
  publicar a imagem do frontend pelo mesmo pipeline da aplicação.

**Evidência:** fluxo completo executável pelo navegador e pela API, testes
end-to-end contra a composição Docker, nenhum dado demonstrativo no bundle,
auditoria das operações sensíveis e relatório de acessibilidade e tamanho.

**Evidência atual do frontend:** shell, dashboard, solicitações, gestão do
atendimento, comentários, anexos, notificações e administração de membros
compilados pela imagem Docker, bundle inicial de `405,37 kB`, budget de erro
de `600 kB`, zero vulnerabilidades na árvore de produção, autenticação OIDC
validada no navegador e trinta e quatro testes Angular cobrindo clientes HTTP,
Bearer token, ausência dos cabeçalhos provisórios, Problem Details,
estados de interface, filtros sincronizados com a URL, idempotência, validações,
encadeamento de versões, conflitos de concorrência, multipart, download,
respostas negativas, paginação de notificações e concessão de papéis com suas
permissões.

## Fora do escopo inicial

- microsserviços;
- Kubernetes;
- event sourcing;
- banco independente por módulo;
- abstrações genéricas de repositório sobre todo o EF Core;
- consistência distribuída tratada como se fosse transacional.

# Roadmap orientado a evidências

O roadmap prioriza fatias verticais executáveis. Uma etapa só é considerada
concluída quando comportamento, testes e operação local podem ser demonstrados.

## 1. Fundação

- [x] reorganizar a solução .NET e remover o endpoint de exemplo;
- [x] criar composição Docker para aplicação, PostgreSQL, RabbitMQ, Redis e
  observabilidade;
- [x] padronizar Problem Details, validação, logs e correlação de traces;
- [x] configurar testes unitários e de integração;
- [ ] validar fronteiras dos módulos com testes de arquitetura;
- [ ] criar CI para backend, frontend, validação das regras Prometheus e
  construção das imagens Docker.

**Evidência atual:** os comandos estão documentados no
[README do backend](../Backend/README.md) e a composição local em
[compose.yaml](../compose.yaml). Testes de arquitetura e CI permanecem
pendentes e, portanto, impedem a conclusão integral da fundação.

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

Antes de iniciar a etapa 7, devem estar concluídas as pendências da
[Fundação](#1-fundação) — testes de arquitetura e CI — e os itens operacionais
abaixo.

- [x] transformar a fundação em checklist e corrigir a evidência da interface
  para refletir somente a integração realmente entregue;
- [x] relacionar as ADRs complementares e ligar evidências aos testes e
  relatórios existentes;
- [x] definir a [política de retenção](operations/data-retention.md) para Outbox
  e auditorias;
- [ ] publicar métricas de idade, quantidade, tentativas e falhas da Outbox;
- [ ] automatizar retenção em lotes e recuperação segura da Outbox, com testes e
  procedimento operacional.

**Evidência exigida:** testes de arquitetura executáveis, workflow versionado,
regras Prometheus validadas, imagens construídas e cenários automatizados de
acúmulo, falha, recuperação e retenção. Os itens de implementação permanecem
desmarcados até que código e testes correspondentes existam.

## 7. Painel administrativo Angular

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
- [ ] implementar comentários e anexos, incluindo upload, validações, listagem,
  download e respostas `403`, `413` e `415`;
- [ ] implementar central de notificações e administração de membros, papéis e
  permissões por tenant;
- [ ] substituir os cabeçalhos provisórios por identidade autenticada e obter
  tenant e usuário de claims confiáveis;
- [ ] cobrir os fluxos com testes unitários, de componentes e end-to-end,
  incluindo autorização negativa, acessibilidade e regressão responsiva;
- [ ] definir budgets de bundle, eliminar vulnerabilidades de produção e
  publicar a imagem do frontend pelo mesmo pipeline da aplicação.

**Evidência:** fluxo completo executável pelo navegador e pela API, testes
end-to-end contra a composição Docker, nenhum dado demonstrativo no bundle,
auditoria das operações sensíveis e relatório de acessibilidade e tamanho.

**Evidência atual do frontend:** shell, dashboard, listagem, criação idempotente,
detalhe, atribuição, transições de situação e gestão de prazo compilados pela
imagem Docker, bundle inicial de `365,38 kB` e dezoito testes Angular cobrindo
clientes HTTP, contexto provisório, Problem Details, estados do dashboard,
busca com debounce, filtros sincronizados com a URL, reutilização da chave
idempotente, validações, carregamento independente de comentários e auditoria,
encadeamento de versões e recuperação de conflitos de concorrência.

## Fora do escopo inicial

- microsserviços;
- Kubernetes;
- event sourcing;
- banco independente por módulo;
- abstrações genéricas de repositório sobre todo o EF Core;
- consistência distribuída tratada como se fosse transacional.

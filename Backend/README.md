# Backend

Monólito modular em ASP.NET Core. A API funciona como composition root; cada
módulo mantém suas camadas de domínio, aplicação, infraestrutura e apresentação.

## Pré-requisitos

- .NET SDK 10
- Docker com Docker Compose
- Visual Studio 2026 com a carga **ASP.NET e desenvolvimento Web**, caso use a IDE

No Visual Studio, abra `CivicOperationsPlatform.sln`. A entrada `Backend.slnx`
é mantida como alias de compatibilidade para instalações que ainda a exibem na
lista de projetos recentes; ambas apontam para os mesmos projetos.

## Executar localmente

Na raiz do repositório:

```powershell
docker compose up -d --build --wait
```

A API estará em `http://localhost:5080`, o frontend em
`http://localhost:4200` e o provedor de identidade será exposto pelo frontend
em `http://localhost:4200/auth`. As migrations são aplicadas pela API durante
a inicialização da composição.

Para executar a API diretamente com hot reload, suba somente as dependências:

```powershell
docker compose up -d --wait postgres rabbitmq redis keycloak
cd Backend
dotnet tool restore
dotnet restore CivicOperationsPlatform.sln
dotnet run --project src/CivicOps.Api/CivicOps.Api.csproj
```

O painel local do RabbitMQ fica em
`http://localhost:15672`, com as credenciais definidas no Compose.

Todas as rotas sob `/api` exigem um token Bearer emitido pelo provedor OpenID
Connect. A API valida assinatura, emissor, audiência e validade do token; o
usuário vem do claim `sub` e o tenant do claim `tenant_id`. Cabeçalhos
`X-Tenant-Id` e `X-User-Id` enviados pelo cliente são descartados e não podem
sobrescrever a identidade autenticada.

O endpoint `POST /api/v1/requests` também exige `Idempotency-Key`. Repetir a
mesma chave, tenant e conteúdo retorna a solicitação originalmente criada sem
consumir outro número de protocolo. Reutilizar a chave com conteúdo diferente
retorna `409 Conflict`.

As leituras disponíveis são:

- `GET /api/v1/requests`: listagem 1-based com `page`, `pageSize`, `search`,
  `status`, `createdFromUtc` e `createdToUtc`;
- `GET /api/v1/requests/dashboard`: resumo operacional projetado com totais,
  prazos, solicitações sem responsável e os cinco itens mais recentes;
- `GET /api/v1/requests/{id}`: detalhe da solicitação dentro do tenant atual;
- `GET /api/v1/requests/{id}/comments`: comentários paginados, do mais recente
  para o mais antigo;
- `GET /api/v1/requests/{id}/audit`: histórico imutável e paginado das
  alterações da solicitação;
- `GET /api/v1/requests/{id}/attachments`: metadados dos anexos;
- `GET /api/v1/requests/{id}/attachments/{attachmentId}/content`: conteúdo do
  anexo com suporte a range;
- `GET /api/v1/notifications`: notificações do usuário autenticado, sempre
  isoladas pelo tenant;
- `GET /api/v1/access/members`: associações, papéis e permissões do tenant.

O dashboard usa cache-aside no Redis, isolado por tenant e com TTL padrão de
30 segundos. Criação e alterações de situação, responsável ou prazo invalidam
a geração do tenant depois do commit. Se Redis estiver indisponível, a leitura
continua pelo PostgreSQL. O cache pode ser desativado com
`DashboardCache:Enabled=false`, e o TTL é configurado por
`DashboardCache:TimeToLive`.

As escritas disponíveis são:

- `PATCH /api/v1/requests/{id}/assignment`: atribui um responsável;
- `PATCH /api/v1/requests/{id}/status`: executa uma transição de situação;
- `PATCH /api/v1/requests/{id}/due-date`: define ou remove o prazo;
- `POST /api/v1/requests/{id}/comments`: registra um comentário append-only;
- `POST /api/v1/requests/{id}/attachments`: envia um arquivo multipart no
  campo `file`;
- `POST /api/v1/access/bootstrap`: cria o primeiro administrador do tenant;
- `PUT /api/v1/access/members/{userId}`: concede um papel ao usuário.

`pageSize` aceita de 1 a 100. A busca é case-insensitive sobre título e
descrição e também aceita um número de protocolo completo.

Os comandos de responsável, situação e prazo exigem a `version` retornada pela
leitura anterior. Uma versão desatualizada retorna `409 Conflict`. O prazo deve
ser futuro e informado em UTC; `dueDateUtc: null` remove o prazo. As transições
permitidas são:

```text
Submitted -> InProgress | Cancelled
InProgress -> Completed | Cancelled
Completed | Cancelled -> estado terminal
```

O responsável, o autor do comentário e o ator da auditoria são armazenados como
UUID sem foreign key até a implementação do módulo de identidade. Comentários
são append-only e não alteram a versão da solicitação, evitando conflito entre
registros simultâneos.

Cada alteração efetiva emite um Domain Event. Antes do commit, a mesma transação
grava:

- um registro imutável em `requests.request_audit`;
- uma mensagem pendente em `requests.outbox_messages`.

Auditoria e Outbox compartilham o identificador estável do evento. Replay
idempotente, no-op e comandos que sofrem rollback não criam registros
duplicados. Um `BackgroundService` reivindica lotes com lease e
`FOR UPDATE SKIP LOCKED`, publica mensagens persistentes no exchange topic
`civicops.events` e só registra `processed_at_utc` depois da confirmação do
broker. O contrato é `at-least-once`.

Uma consulta agregada ao PostgreSQL, executada a cada 15 segundos por padrão,
publica métricas de mensagens pendentes, idade da mais antiga, mensagens em
retry, leases ativos e tentativas acumuladas. O processor também conta
publicações confirmadas, falhas, leases expirados e falhas da própria coleta.
Nenhuma série contém tenant, payload ou texto de exceção. Configure com
`OutboxMetrics:Enabled` e `OutboxMetrics:CollectionInterval`.

A retenção remove somente mensagens processadas há mais de 30 dias. O worker
executa em intervalos configuráveis, usa lotes ordenados com
`FOR UPDATE SKIP LOCKED`, limita a quantidade de lotes por ciclo e registra
remoções e falhas em métricas. Mensagens pendentes ou com falha nunca são
expiradas. Configure pela seção `OutboxRetention`.

O módulo `Notifications` mantém schema, domínio e migrations próprios dentro do
mesmo processo. O consumidor da fila
`civicops.notifications.request-assigned` trata
`requests.responsible-assigned.v1`. Antes de criar a notificação, reserva o
`MessageId` em `notifications.processed_messages` na mesma transação do efeito.
Uma entrega repetida recebe `ack` sem criar outra notificação; mensagens só
recebem `ack` depois do commit no PostgreSQL.

Falhas transitórias passam por filas duráveis de retry com atrasos crescentes
configurados em `NotificationsConsumer:RetryDelays` (5 segundos, 30 segundos e
2 minutos por padrão). Cada republicação usa publisher confirm e a entrega
original só recebe `ack` depois da confirmação do broker. Ao expirar o atraso,
a mensagem retorna diretamente para a fila original, sem republicar o evento
para outros módulos. Ao esgotar as tentativas, a mensagem segue para
`civicops.notifications.request-assigned.dead-letter`. Payloads inválidos vão
diretamente para essa DLQ, sem retry. Os headers `x-civicops-retry-count`,
`x-civicops-last-error`, `x-civicops-failed-at` e
`x-civicops-dead-letter-reason` preservam o contexto operacional.

O contexto W3C da requisição (`traceparent`, `tracestate` e `baggage`) é
persistido junto da Outbox. O publisher restaura esse contexto, cria um span
`Producer` e o injeta nos headers AMQP. Notifications cria spans `Consumer` e
novos spans `Producer` para retry e DLQ, preservando o mesmo `traceId` durante
todo o fluxo, inclusive após reinicialização do processo. Os ActivitySources
usados são `CivicOps.Requests` e `CivicOps.Notifications`.

O SDK OpenTelemetry e a instrumentação ASP.NET Core estão ativos. O exportador
OTLP é opcional para que o backend continue executável sem collector:

```powershell
$env:OpenTelemetry__Otlp__Enabled = "true"
$env:OpenTelemetry__Otlp__Endpoint = "http://localhost:4317"
dotnet run --project src/CivicOps.Api/CivicOps.Api.csproj
```

O meter `CivicOps.Requests.Cache` publica contadores de hit, miss, falha e
invalidação, além da duração das operações do cache. A decisão e o ganho medido
estão documentados em
[`docs/performance/2026-07-29-request-dashboard-cache.md`](../docs/performance/2026-07-29-request-dashboard-cache.md).

Para validar métricas e alertas localmente, use o perfil de observabilidade:

```powershell
$env:OTEL_ENABLED = "true"
docker compose --profile observability up -d --build --wait
```

O Prometheus fica em `http://localhost:9090`. Objetivos, orçamentos de erro,
severidades e runbooks estão no
[guia operacional](../docs/operations/service-objectives-and-alerts.md).

## Identity & Access

A autenticação usa OpenID Connect com Authorization Code e PKCE no frontend e
JWT Bearer na API. O Compose fornece um Keycloak de desenvolvimento com realm,
clientes e usuário demonstrativo importados de
`identity/keycloak/civicops-realm.json`. Em ambientes reais, configure
`Authentication:Authority`, `Authentication:Audience` e HTTPS para o provedor
corporativo.

Os testes de integração executam no ambiente `IntegrationTests`, onde um
handler restrito ao processo de teste converte os cabeçalhos existentes em
claims. Esse modo não é habilitado pela configuração de execução normal.

As associações são independentes por tenant e usam os papéis
`Administrator`, `Operator` e `Reader`. O catálogo de permissões é versionado
no código e a associação fica em `identity_access.tenant_memberships`.

O bootstrap do primeiro administrador usa lock transacional no PostgreSQL e é
habilitado por `IdentityAccess:BootstrapEnabled`. Ele fica desabilitado por
padrão e deve ser ativado somente durante o provisionamento inicial. Depois
dele, apenas `Administrator` pode conceder papéis e listar membros. O último
administrador não pode ser rebaixado.

Bootstrap, concessão ou alteração de papel e listagem de membros são gravados
atomicamente em `identity_access.access_audit`. O registro contém somente
identificadores, ação, instante e metadados mínimos.

## Anexos

O PostgreSQL armazena somente metadados em
`requests.request_attachments`: tenant, solicitação, autor, nome, content type,
tamanho, SHA-256, chave interna e data. O conteúdo fica fora do banco através
de `IAttachmentContentStore`.

O adapter inicial grava em `.data/attachments`, caminho ignorado pelo Git e
configurável por `AttachmentStorage:RootPath`. O limite padrão é 25 MiB,
configurável por `AttachmentStorage:MaximumSizeBytes`. A escrita usa arquivo
temporário, cálculo incremental de SHA-256 e rename atômico. Se o commit dos
metadados falhar, o conteúdo é removido como compensação.

Listagens de metadados e downloads autorizados são registrados em
`requests.request_audit`. Essas leituras não publicam eventos na Outbox e não
copiam nome, hash ou conteúdo do arquivo para o payload da auditoria.

O nome informado pelo cliente nunca participa da chave física. A implementação
filesystem mantém o desenvolvimento local autocontido; a porta permite
substituir o adapter por S3/MinIO sem alterar o domínio.

São permitidos PDF, PNG e JPEG. Extensão, `Content-Type` e assinatura real do
arquivo precisam corresponder. Autor e responsável preservam acesso direto;
`Reader` pode listar e baixar, enquanto `Operator` e `Administrator` também
podem enviar. Usuários sem vínculo ou permissão recebem `403`. O tamanho é
conferido durante o streaming, sem confiar no valor declarado no multipart.

## Testes

Com PostgreSQL e RabbitMQ do Compose em execução:

```powershell
dotnet test CivicOperationsPlatform.sln
```

Os nove testes de arquitetura em
[`CivicOps.ArchitectureTests`](tests/CivicOps.ArchitectureTests) validam as
dependências entre camadas, o isolamento dos módulos, o composition root e a
propriedade dos `DbContext`. Eles não precisam da infraestrutura do Compose.

Os testes de integração usam tenants aleatórios e verificam no PostgreSQL real:

- sequências de protocolo independentes por tenant;
- geração atômica sob requisições concorrentes;
- retries sequenciais e concorrentes com a mesma chave de idempotência;
- conflito ao reutilizar uma chave com outro conteúdo.
- paginação, filtros e busca executados no PostgreSQL;
- isolamento entre tenants nas listagens e nos detalhes.
- atribuição de responsável e workflow de situação;
- concorrência otimista, inclusive com atualizações simultâneas;
- definição, remoção e validação de prazo;
- registro, paginação e isolamento de comentários;
- auditoria e Outbox atômicas, sem duplicação em replay idempotente ou falha;
- publicação real no RabbitMQ com mensagem persistente, publisher confirm e
  marcação posterior da Outbox;
- criação de notificação de atribuição e reprocessamento do mesmo `MessageId`
  sem duplicar o efeito;
- retry real no RabbitMQ com backoff, publisher confirm e encaminhamento para
  DLQ após esgotar as tentativas;
- encaminhamento direto de mensagens inválidas para DLQ, sem executar o
  processador de aplicação;
- preservação do mesmo `traceId` entre HTTP, Outbox, publicação confirmada,
  retries e DLQ;
- upload multipart, metadados no PostgreSQL, conteúdo no filesystem, SHA-256,
  download, auditoria, Outbox e isolamento por tenant;
- autorização negativa de anexos, allowlist de formatos, assinatura real,
  limite durante streaming e limpeza de arquivos rejeitados;
- papéis por tenant, menor privilégio, concessão administrativa, proteção do
  último administrador e bootstrap concorrente.
- auditoria de leituras de anexos e operações administrativas de acesso, sem
  registrar tentativas negadas como acessos bem-sucedidos.
- dashboard projetado, com totais por situação, prazos operacionais, ordenação
  determinística e isolamento entre tenants.

Os planos de execução do dashboard e o dataset reproduzível estão documentados
em
[`docs/performance/2026-07-29-request-dashboard-indexes.md`](../docs/performance/2026-07-29-request-dashboard-indexes.md).

O teste de carga reproduzível constrói a API, cria 100 mil solicitações, compara
PostgreSQL sem cache com hits no Redis e limpa os recursos temporários:

```powershell
powershell -ExecutionPolicy Bypass `
  -File performance/run-request-dashboard-load-test.ps1
```

Parâmetros, ambiente, percentis, throughput, erros e limitações estão no
[relatório de carga](../docs/performance/2026-07-29-request-dashboard-load-test.md).

## Migration

Para criar uma nova migration do módulo Requests:

```powershell
dotnet ef migrations add NomeDaMigration `
  --project src/Modules/Requests/CivicOps.Modules.Requests.Infrastructure/CivicOps.Modules.Requests.Infrastructure.csproj `
  --startup-project src/CivicOps.Api/CivicOps.Api.csproj `
  --context RequestsDbContext `
  --output-dir Persistence/Migrations
```

Para o módulo Notifications, altere `--project` e `--context` para:

```text
src/Modules/Notifications/CivicOps.Modules.Notifications.Infrastructure
NotificationsDbContext
```

Para o módulo Identity & Access:

```text
src/Modules/IdentityAccess/CivicOps.Modules.IdentityAccess.Infrastructure
IdentityAccessDbContext
```

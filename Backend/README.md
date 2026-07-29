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
docker compose up -d --wait
```

Em `Backend/`:

```powershell
dotnet tool restore
dotnet restore CivicOperationsPlatform.sln
dotnet run --project src/CivicOps.Api/CivicOps.Api.csproj
```

A API estará em `http://localhost:5080`. Em ambiente de desenvolvimento, as
migrations são aplicadas na inicialização. O painel local do RabbitMQ fica em
`http://localhost:15672`, com as credenciais definidas no Compose.

Uma requisição de exemplo está em [CivicOps.Api.http](CivicOps.Api.http). O
cabeçalho `X-Tenant-Id` é provisório e será substituído pelo tenant obtido da
identidade autenticada. Escritas também exigem `X-User-Id`, usado como autor da
operação na auditoria e igualmente provisório até o módulo de identidade.

O endpoint `POST /api/v1/requests` também exige `Idempotency-Key`. Repetir a
mesma chave, tenant e conteúdo retorna a solicitação originalmente criada sem
consumir outro número de protocolo. Reutilizar a chave com conteúdo diferente
retorna `409 Conflict`.

As leituras disponíveis são:

- `GET /api/v1/requests`: listagem 1-based com `page`, `pageSize`, `search`,
  `status`, `createdFromUtc` e `createdToUtc`;
- `GET /api/v1/requests/{id}`: detalhe da solicitação dentro do tenant atual;
- `GET /api/v1/requests/{id}/comments`: comentários paginados, do mais recente
  para o mais antigo;
- `GET /api/v1/requests/{id}/audit`: histórico imutável e paginado das
  alterações da solicitação.

As escritas disponíveis são:

- `PATCH /api/v1/requests/{id}/assignment`: atribui um responsável;
- `PATCH /api/v1/requests/{id}/status`: executa uma transição de situação;
- `PATCH /api/v1/requests/{id}/due-date`: define ou remove o prazo;
- `POST /api/v1/requests/{id}/comments`: registra um comentário append-only.

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
broker. O contrato é `at-least-once`; retry exponencial e dead letter pertencem
às próximas fatias.

## Testes

Com PostgreSQL e RabbitMQ do Compose em execução:

```powershell
dotnet test CivicOperationsPlatform.sln
```

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
  marcação posterior da Outbox.

## Migration

Para criar uma nova migration do módulo Requests:

```powershell
dotnet ef migrations add NomeDaMigration `
  --project src/Modules/Requests/CivicOps.Modules.Requests.Infrastructure/CivicOps.Modules.Requests.Infrastructure.csproj `
  --startup-project src/CivicOps.Api/CivicOps.Api.csproj `
  --context RequestsDbContext `
  --output-dir Persistence/Migrations
```

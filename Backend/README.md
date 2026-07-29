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
docker compose up -d --wait postgres
```

Em `Backend/`:

```powershell
dotnet tool restore
dotnet restore CivicOperationsPlatform.sln
dotnet run --project src/CivicOps.Api/CivicOps.Api.csproj
```

A API estará em `http://localhost:5080`. Em ambiente de desenvolvimento, as
migrations são aplicadas na inicialização.

Uma requisição de exemplo está em [CivicOps.Api.http](CivicOps.Api.http). O
cabeçalho `X-Tenant-Id` é provisório e será substituído pelo tenant obtido da
identidade autenticada.

O endpoint `POST /api/v1/requests` também exige `Idempotency-Key`. Repetir a
mesma chave, tenant e conteúdo retorna a solicitação originalmente criada sem
consumir outro número de protocolo. Reutilizar a chave com conteúdo diferente
retorna `409 Conflict`.

As leituras disponíveis são:

- `GET /api/v1/requests`: listagem 1-based com `page`, `pageSize`, `search`,
  `status`, `createdFromUtc` e `createdToUtc`;
- `GET /api/v1/requests/{id}`: detalhe da solicitação dentro do tenant atual.

`pageSize` aceita de 1 a 100. A busca é case-insensitive sobre título e
descrição e também aceita um número de protocolo completo.

## Testes

Com o PostgreSQL do Compose em execução:

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

## Migration

Para criar uma nova migration do módulo Requests:

```powershell
dotnet ef migrations add NomeDaMigration `
  --project src/Modules/Requests/CivicOps.Modules.Requests.Infrastructure/CivicOps.Modules.Requests.Infrastructure.csproj `
  --startup-project src/CivicOps.Api/CivicOps.Api.csproj `
  --context RequestsDbContext `
  --output-dir Persistence/Migrations
```

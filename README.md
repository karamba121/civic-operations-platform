# Civic Operations Platform

Plataforma empresarial para gestão de processos administrativos: solicitações,
protocolos, responsáveis, comentários, anexos, prazos, auditoria e notificações.

O objetivo deste projeto é demonstrar como construir um sistema empresarial
consistente e observável em .NET sem transformar cada limite lógico em um
microsserviço artificial.

> **Status:** a primeira fatia vertical do backend está implementada, incluindo
> solicitações, integração assíncrona, anexos, papéis por tenant e auditoria de
> acessos sensíveis. A interface Angular e as evidências operacionais continuam
> em evolução conforme o roadmap.

## Por que um monólito modular?

Bounded contexts representam limites do modelo e da linguagem do negócio. Eles
não exigem, por si só, processos, bancos ou contêineres independentes.

Neste projeto, os módulos têm fronteiras explícitas no código e se comunicam por
contratos definidos, mas são implantados inicialmente como uma única aplicação.
Isso preserva consistência transacional, reduz custo operacional e mantém uma
rota de extração caso um limite realmente passe a exigir escala ou ciclo de
implantação independente.

```mermaid
flowchart LR
    UI["Angular"] --> API["ASP.NET Core API"]

    subgraph MM["Monólito modular"]
        API --> REQ["Solicitações e protocolos"]
        API --> IAM["Identidade e acesso"]
        API --> DOC["Documentos"]
        API --> AUD["Auditoria"]
        REQ --> OUT["Outbox"]
        DOC --> OUT
    end

    REQ --> DB[("PostgreSQL")]
    IAM --> DB
    DOC --> DB
    AUD --> DB
    OUT --> MQ["RabbitMQ"]
    API --> CACHE["Redis"]
    MQ --> WORKER["Processadores assíncronos"]
```

## O que este projeto pretende comprovar

| Competência | Evidência no projeto |
|---|---|
| C# e .NET | APIs tipadas, nullable reference types, testes, tratamento de erros e código assíncrono |
| Modelagem de domínio | Agregados, value objects, invariantes, domain events e linguagem ubíqua |
| Decisões arquiteturais | ADRs, fronteiras de módulos, trade-offs e critérios explícitos de evolução |
| Integração assíncrona | Outbox transacional, RabbitMQ, consumidores idempotentes, retry e dead letter |
| Performance | Paginação, índices, projeções, cache mensurado e testes de carga reproduzíveis |
| Consistência | Transações locais, concorrência otimista, idempotência e cenários de recuperação |
| Sistemas empresariais reais | Multi-tenancy, autorização, auditoria, anexos, prazos e observabilidade |

O projeto não considera a presença de uma tecnologia como evidência suficiente.
Cada mecanismo relevante deve ser acompanhado por um cenário executável, teste
automatizado, métrica ou decisão documentada.

## Stack

- ASP.NET Core e Entity Framework Core
- PostgreSQL
- RabbitMQ
- Redis
- Angular
- Docker Compose
- OpenTelemetry
- GitHub Actions

## Módulos planejados

- **Tenancy:** organizações, contexto do tenant e isolamento de dados.
- **Identity & Access:** usuários, papéis e permissões.
- **Requests:** solicitações, protocolo, situação, prioridade, prazo e responsável.
- **Documents:** metadados, anexos e políticas de acesso.
- **Notifications:** Inbox idempotente, notificações, preferências, templates e
  entrega assíncrona.
- **Auditing:** trilha imutável de operações relevantes.

Os módulos não acessam diretamente as tabelas ou tipos internos uns dos outros.
Integrações síncronas usam contratos internos explícitos; efeitos assíncronos
partem de eventos gravados na Outbox.

## Princípios de implementação

- Um único deploy enquanto essa for a opção mais simples e segura.
- Fronteiras lógicas fortes, mesmo compartilhando processo e banco.
- Uma transação local para alterações que precisam ser atômicas.
- CQRS somente quando leitura e escrita possuem necessidades diferentes.
- Redis nunca é a fonte de verdade dos dados empresariais.
- Mensagens podem ser entregues mais de uma vez; consumidores devem ser idempotentes.
- Toda consulta multi-tenant deve ter isolamento verificável por testes.
- Performance é demonstrada por medidas, não por abstrações preventivas.
- Observabilidade faz parte do comportamento da aplicação.

## Documentação

- [Visão da arquitetura](docs/architecture/overview.md)
- [ADR-001: monólito modular como unidade de implantação](docs/adr/001-modular-monolith.md)
- [ADR-002: uso seletivo de CQRS](docs/adr/002-selective-cqrs.md)
- [ADR-003: Outbox para publicação confiável](docs/adr/003-transactional-outbox.md)
- [ADR-004: contexto de observabilidade através da Outbox](docs/adr/004-observability-context-through-outbox.md)
- [ADR-005: conteúdo de anexos fora do banco relacional](docs/adr/005-attachment-content-storage.md)
- [ADR-006: segurança básica de anexos](docs/adr/006-attachment-security-baseline.md)
- [ADR-007: papéis e permissões por tenant](docs/adr/007-tenant-roles-and-permissions.md)
- [ADR-008: auditoria de dados sensíveis](docs/adr/008-sensitive-data-audit.md)
- [ADR-009: projeções do dashboard](docs/adr/009-request-dashboard-projections.md)
- [ADR-010: índices do dashboard](docs/adr/010-request-dashboard-indexes.md)
- [ADR-011: cache medido do dashboard](docs/adr/011-request-dashboard-cache.md)
- [Teste de carga reproduzível do dashboard](docs/performance/2026-07-29-request-dashboard-load-test.md)
- [Roadmap orientado a evidências](docs/roadmap.md)

## Execução local

```powershell
docker compose up -d --wait
cd Backend
dotnet tool restore
dotnet restore CivicOperationsPlatform.sln
dotnet run --project src/CivicOps.Api/CivicOps.Api.csproj
```

Consulte o [README do backend](Backend/README.md) para chamadas de exemplo,
testes e criação de migrations.

## Licença

A licença será definida antes da primeira versão pública.

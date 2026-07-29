# ADR-007: Papéis e permissões por tenant

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

`X-Tenant-Id` limita o conjunto de dados e `X-User-Id` identifica o ator
provisório, mas nenhum deles comprova que o usuário possui uma concessão dentro
da organização. Regras baseadas apenas em vínculo com uma solicitação também
não atendem funções administrativas e operacionais.

O limite lógico de Identity & Access não justifica um deploy separado. Ele deve
permanecer no monólito modular, controlando seu modelo e schema.

## Decisão

Criar o módulo `IdentityAccess` com duas superfícies:

- `Core`: modelo de associação, catálogo de permissões, contratos e casos de
  uso;
- `Infrastructure`: PostgreSQL, autorização, endpoints e composição.

As associações são persistidas em
`identity_access.tenant_memberships`, com unicidade por tenant e usuário. Um
mesmo usuário pode possuir papéis diferentes em tenants diferentes.

Os papéis são versionados no código e seguem menor privilégio:

| Papel | Capacidades |
| --- | --- |
| `Administrator` | administrar membros e executar todas as operações catalogadas |
| `Operator` | ler e enviar anexos, sem administrar acessos |
| `Reader` | listar e baixar anexos |

O catálogo usa identificadores estáveis como `access.manage`,
`attachments.read` e `attachments.write`. Papéis não são strings livres no
banco e permissões desconhecidas não são concedidas.

O primeiro administrador é criado por `POST /api/v1/access/bootstrap`. O
bootstrap:

- é desabilitado por padrão por `IdentityAccess:BootstrapEnabled`;
- usa lock transacional por tenant no PostgreSQL;
- permite somente uma inicialização, inclusive sob concorrência;
- deve ser desabilitado após o provisionamento inicial.

Depois do bootstrap, apenas quem possui `access.manage` pode conceder papéis ou
listar membros. O último administrador não pode ser rebaixado.

Anexos preservam a regra de acesso do autor/responsável e aceitam permissões
adicionais por papel. `Reader` pode listar e baixar anexos; `Operator` e
`Administrator` também podem enviar.

## Consequências

- autorização e isolamento de tenant passam a ser conceitos distintos;
- o módulo continua na mesma API, processo e banco físico, sem microsserviço
  artificial;
- o contrato `IPermissionAuthorizer` será adotado gradualmente pelos demais
  casos de uso; permissões ainda não aplicadas não aparecem no catálogo;
- os cabeçalhos continuam sendo identidade provisória, não autenticação; uma
  integração autenticada deverá fornecer tenant e usuário confiáveis;
- papéis customizáveis e concessões individuais permanecem fora do escopo até
  existir necessidade demonstrada.

## Evidências

Os testes cobrem catálogo de menor privilégio, concessão administrativa,
negação para leitor, acesso de operador, isolamento entre tenants, proteção do
último administrador e bootstrap concorrente com um único vencedor.

A auditoria de bootstrap, alteração de papel e listagem de membros é definida
no [ADR-008](008-sensitive-data-audit.md).

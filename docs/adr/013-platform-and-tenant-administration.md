# ADR-013: Administração da plataforma e provisionamento de tenants

- **Status:** aceito
- **Data:** 2026-07-30
- **Complementa:** [ADR-007](007-tenant-roles-and-permissions.md) e
  [ADR-012](012-authenticated-identity-with-oidc.md)

## Contexto

O papel `Administrator` existente pertence a um tenant e não pode administrar
a plataforma inteira. Faltavam catálogo de tenants, administrador global,
provisionamento de identidades e um destino diferente após o login.

Guardar senhas ou implementar autenticação local paralela ao OIDC criaria duas
fontes de identidade. A aplicação deve continuar confiando no provedor OIDC,
mas precisa coordenar a criação de usuários e seus vínculos locais.

## Decisão

Separar duas autoridades:

- administrador da plataforma, identificado por `platform_admin=true`, sem
  `tenant_id`, autorizado a criar tenants e outros administradores globais;
- administrador do tenant, persistido como `TenantRole.Administrator`, com
  `tenant_id`, autorizado a criar usuários somente dentro do próprio tenant.

O módulo `IdentityAccess` permanece no monólito modular e passa a possuir:

- `identity_access.tenants`, catálogo e ciclo de vida do tenant;
- `identity_access.managed_users`, perfil mínimo das identidades provisionadas;
- `identity_access.tenant_memberships`, vínculo e papel por tenant;
- `identity_access.platform_administration_audit`, evidência das operações
  globais.

O Keycloak continua proprietário do login, senha e sessão. A API usa a Admin
REST API do Keycloak para criar a identidade. A senha inicial:

- é recebida apenas na requisição TLS;
- é enviada ao Keycloak;
- não é persistida no PostgreSQL, auditoria ou logs;
- deve ser substituída por política apropriada no ambiente de produção.

Se o provisionamento no Keycloak funcionar e a transação PostgreSQL falhar, a
API tenta remover a identidade recém-criada. Falhas de compensação exigem
reconciliação operacional, sem esconder a falha original.

Ao criar um tenant, a mesma operação cria:

1. o registro do tenant;
2. a identidade do administrador no Keycloak com `tenant_id` e `tenant_name`;
3. o perfil local;
4. o vínculo `TenantRole.Administrator`;
5. a auditoria global.

O realm local importa o usuário `admin`, senha de desenvolvimento
`civic_ops_dev`, com `platform_admin=true`. A migration registra o mesmo UUID
como administrador global ativo. Essas credenciais são exclusivamente locais e
devem ser substituídas em qualquer ambiente compartilhado ou de produção.

## Navegação

Depois do login:

- `platform_admin=true` direciona para `/platform`;
- uma identidade com `tenant_id` entra no workspace operacional existente;
- uma identidade sem nenhuma dessas concessões recebe uma página de acesso
  inválido.

O frontend não envia headers de identidade. A API remove quaisquer headers
externos e deriva o contexto exclusivamente dos claims autenticados.

## Consequências

- `PlatformAdministrator` e `TenantRole.Administrator` não são equivalentes;
- um administrador de tenant não acessa endpoints `/api/v1/platform`;
- usuários gerenciados nesta etapa pertencem a um tenant por identidade;
- o modelo de memberships continua capaz de representar múltiplos vínculos,
  mas seleção de tenant ativo permanece fora desta etapa;
- a disponibilidade do provisionamento depende da Admin API do Keycloak;
- as credenciais administrativas do provedor são segredo operacional.

## Evidências

- teste de integração cria tenant, administrador inicial e usuário do tenant
  contra PostgreSQL real;
- teste negativo impede administrador de tenant de acessar a administração
  global;
- testes Angular verificam os contratos HTTP sem headers provisórios;
- build do frontend valida os dois shells e o roteamento por claim.

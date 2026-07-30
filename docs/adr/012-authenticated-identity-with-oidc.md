# ADR-012: Identidade autenticada com OpenID Connect

- **Status:** aceito
- **Data:** 2026-07-30

## Contexto

O frontend e a API usavam `X-Tenant-Id` e `X-User-Id` como contexto
provisório. Como esses valores eram controlados pelo cliente, eles não
comprovavam identidade nem pertencimento ao tenant e não podiam sustentar uma
fronteira de segurança.

A solução precisa funcionar com uma SPA Angular, preservar o isolamento por
tenant da aplicação e permitir a troca do provedor de identidade sem acoplar o
domínio a um produto específico.

## Decisão

Adotar OpenID Connect com Authorization Code e PKCE no frontend. A SPA usa um
cliente público, mantém os tokens somente em memória, renova o access token
antes de expirar e envia `Authorization: Bearer` nas chamadas à API.

A API usa autenticação JWT Bearer e exige:

- assinatura válida e metadados obtidos do provedor configurado;
- emissor e audiência esperados;
- token dentro do período de validade;
- `sub` como UUID não vazio;
- `tenant_id` como UUID para usuários de tenant ou `platform_admin=true` para administradores globais.

O claim `sub` identifica o usuário, `tenant_id` identifica a organização e `platform_admin` distingue a administração global. A
API remove qualquer `X-Tenant-Id` ou `X-User-Id` recebido externamente e cria o
contexto interno somente depois da validação do token. Isso permite migrar os
casos de uso existentes de forma incremental sem confiar nos cabeçalhos do
cliente.

O Compose inclui Keycloak apenas como provedor local reproduzível. O realm
versionado configura:

- cliente público `civicops-frontend` com PKCE S256;
- audiência `civicops-api`;
- claims de tenant para o usuário demonstrativo;
- proxy `/auth` no mesmo endereço do frontend.

O backend permanece compatível com qualquer provedor OpenID Connect que emita
o contrato de claims definido acima. HTTPS continua obrigatório fora do
ambiente local.

Para preservar a suíte existente, o ambiente `IntegrationTests` usa um
esquema de autenticação exclusivo de testes que converte os cabeçalhos
provisórios em claims. A configuração normal nunca ativa esse esquema.

## Consequências

- chamadas anônimas à API recebem `401`;
- tokens autenticados sem claims válidos de usuário ou tenant recebem `403`;
- valores de identidade forjados em cabeçalhos não alteram o contexto;
- logout, renovação e expiração passam a fazer parte do ciclo do frontend;
- o provisionamento de usuários e tenants no provedor é uma responsabilidade
  operacional externa ao monólito;
- o Keycloak em modo de desenvolvimento e suas credenciais demonstrativas não
  são adequados para produção.

## Evidências

- testes das APIs Angular verificam o Bearer token e a ausência dos cabeçalhos
  provisórios;
- o build da API valida a configuração JWT Bearer;
- a composição completa valida o discovery interno, o proxy de autenticação e
  a inicialização ordenada;
- o fluxo no navegador valida login PKCE, claims exibidas no shell e acesso
  autenticado ao dashboard.

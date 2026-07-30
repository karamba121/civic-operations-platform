# Frontend

Painel administrativo Angular da Civic Operations Platform. O TailAdmin é
mantido apenas como fundação visual; rotas, componentes, dados e dependências
demonstrativas foram removidos.

## Funcionalidades atuais

- shell administrativo adaptado ao domínio cívico;
- configuração de desenvolvimento e produção;
- proxy local de `/api` para a API;
- autenticação OpenID Connect com Authorization Code e PKCE;
- tenant e usuário obtidos de claims confiáveis do token de acesso;
- cliente HTTP tipado com tratamento de Problem Details;
- dashboard operacional de solicitações;
- listagem com busca, filtros e paginação;
- criação idempotente com geração de protocolo;
- detalhe com comentários e histórico de auditoria;
- atribuição de responsável, transições de situação e gestão de prazo;
- recuperação orientada em conflitos de atualização simultânea;
- inclusão de comentários;
- envio, validação, listagem e download de anexos PDF, PNG e JPEG;
- central paginada de notificações vinculadas às solicitações;
- administração de membros, papéis e permissões por tenant.

As próximas fatias estão versionadas no
[roadmap](../docs/roadmap.md).

## Executar pela composição

Na raiz do repositório:

```powershell
docker compose up -d --build --wait
```

O frontend estará em `http://localhost:4200`. O Nginx serve a aplicação,
encaminha `/api` para o serviço da API e `/auth` para o provedor de identidade.

O ambiente local contém um usuário demonstrativo:

- usuário: `admin`;
- senha: `civic_ops_dev`;
- organização: `Prefeitura Municipal`.

Essas credenciais existem somente no realm local versionado em
`identity/keycloak/civicops-realm.json` e devem ser substituídas em qualquer
ambiente compartilhado.

## Desenvolvimento

```powershell
npm ci
npm start
```

O servidor de desenvolvimento usa `proxy.conf.json` e fica disponível em
`http://localhost:4200`. Para autenticar, mantenha também o Keycloak local em
execução:

```powershell
docker compose up -d --wait keycloak
```

## Validação

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

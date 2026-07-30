# Frontend

Painel administrativo Angular da Civic Operations Platform. O TailAdmin é
mantido apenas como fundação visual; rotas, componentes, dados e dependências
demonstrativas foram removidos.

## Funcionalidades atuais

- shell administrativo adaptado ao domínio cívico;
- configuração de desenvolvimento e produção;
- proxy local de `/api` para a API;
- contexto provisório de tenant e usuário;
- cliente HTTP tipado com tratamento de Problem Details;
- dashboard operacional de solicitações;
- listagem com busca, filtros e paginação;
- criação idempotente com geração de protocolo;
- detalhe com comentários e histórico de auditoria.

As próximas fatias estão versionadas no
[roadmap](../docs/roadmap.md).

## Executar pela composição

Na raiz do repositório:

```powershell
docker compose up -d --build --wait
```

O frontend estará em `http://localhost:4200`. O Nginx serve a aplicação e
encaminha `/api` para o serviço da API.

## Desenvolvimento

```powershell
npm ci
npm start
```

O servidor de desenvolvimento usa `proxy.conf.json` e fica disponível em
`http://localhost:4200`.

## Validação

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

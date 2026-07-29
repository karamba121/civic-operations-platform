# Roadmap orientado a evidências

O roadmap prioriza fatias verticais executáveis. Uma etapa só é considerada
concluída quando comportamento, testes e operação local podem ser demonstrados.

## 1. Fundação

- reorganizar a solução .NET e remover o endpoint de exemplo;
- criar composição Docker para PostgreSQL, RabbitMQ, Redis e observabilidade;
- padronizar Problem Details, validação, logs e correlation ID;
- configurar testes unitários, de integração e de arquitetura;
- criar CI para build, testes, análise e imagens.

**Evidência:** checkout limpo sobe o ambiente e executa todos os testes com
comandos documentados.

## 2. Primeira fatia vertical: solicitações

- [x] criar solicitação com idempotência e gerar protocolo por tenant;
- [x] listar, filtrar e consultar detalhes;
- [x] atribuir responsável e alterar situação;
- [x] registrar comentário e prazo;
- [x] implementar concorrência otimista;
- [x] registrar auditoria e evento na Outbox.

**Evidência:** fluxo executável pela interface Angular e pela API, com testes
contra PostgreSQL real cobrindo isolamento entre tenants e conflito concorrente.

## 3. Integração assíncrona

- [x] publicar eventos da Outbox no RabbitMQ;
- processar notificações de maneira idempotente;
- aplicar retry, backoff e dead letter;
- propagar contexto de observabilidade.

**Evidência:** cenários automatizados de indisponibilidade, repetição de mensagem
e recuperação sem perda ou duplicação do efeito.

## 4. Documentos e segurança

- armazenar metadados e conteúdo fora do banco;
- validar tamanho, tipo e autorização;
- implementar papéis e permissões por tenant;
- auditar leitura e alteração de dados sensíveis.

**Evidência:** testes de autorização negativa, isolamento de tenant e ciclo de
vida do anexo.

## 5. Performance e operação

- criar dashboard e consultas projetadas;
- definir índices a partir de planos de execução;
- introduzir cache apenas onde houver ganho medido;
- executar testes de carga reproduzíveis;
- documentar objetivos de serviço e alertas.

**Evidência:** relatório versionado com dataset, hardware, parâmetros, latências
percentis, throughput, erros e comparação antes/depois.

## Fora do escopo inicial

- microsserviços;
- Kubernetes;
- event sourcing;
- banco independente por módulo;
- abstrações genéricas de repositório sobre todo o EF Core;
- consistência distribuída tratada como se fosse transacional.

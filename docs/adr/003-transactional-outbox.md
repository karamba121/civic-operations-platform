# ADR-003: Outbox para publicação confiável

- **Status:** aceito
- **Data:** 2026-07-29
- **Política operacional:** [retenção de Outbox e auditorias](../operations/data-retention.md)

## Contexto

Uma alteração no PostgreSQL e a publicação de uma mensagem no RabbitMQ não
participam da mesma transação distribuída. Publicar antes do commit pode anunciar
uma alteração que falhou; publicar depois pode perder a mensagem se o processo
for interrompido.

## Decisão

Persistir eventos de integração em uma tabela Outbox na mesma transação da
alteração de negócio. Um processador em background selecionará registros
pendentes, publicará no RabbitMQ e registrará o resultado.

O contrato assume entrega `at-least-once`. Consumidores usarão um identificador
estável da mensagem para impedir efeitos duplicados.

Falhas transitórias no consumidor terão retry com backoff. Mensagens que
excederem o limite de tentativas serão movidas para uma dead-letter queue.

Mensagens processadas seguem a política de retenção operacional. Mensagens
pendentes ou com falha nunca expiram automaticamente.

## Consequências

- nenhuma alteração confirmada perde silenciosamente seu evento;
- consumidores precisam ser idempotentes;
- a entrega é posterior ao commit e possui atraso mensurável;
- a tabela exige retenção, índices e monitoramento;
- sucesso de publicação não significa conclusão do efeito no consumidor.

## Evidências exigidas

- teste que interrompe a publicação e demonstra reprocessamento;
- teste de entrega duplicada sem duplicação do efeito;
- métricas para idade, quantidade, tentativas e falhas da Outbox;
- correlação do trace entre requisição, publicação e consumo.

**Rastreabilidade:** a atomicidade e o replay estão cobertos por
[AuditAndOutboxEndpointTests](../../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/AuditAndOutboxEndpointTests.cs);
a publicação confirmada e a propagação do trace por
[OutboxRabbitMqPublishingTests](../../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/OutboxRabbitMqPublishingTests.cs);
idempotência, retries e dead letter por
[NotificationIdempotencyTests](../../Backend/tests/CivicOps.Modules.Notifications.IntegrationTests/NotificationIdempotencyTests.cs).
As métricas completas e a automação de retenção permanecem pendentes no
[roadmap](../roadmap.md).

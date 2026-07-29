# ADR-004: Contexto de observabilidade através da Outbox

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

A requisição HTTP e a publicação da Outbox não acontecem no mesmo fluxo de
execução. O evento pode ser publicado segundos depois ou após a reinicialização
do processo. Manter somente `Activity.Current` em memória quebraria o trace
entre a operação de negócio, o publisher e o consumidor.

Retries também não devem iniciar traces independentes, pois são novas
tentativas de entrega da mesma operação assíncrona.

## Decisão

Persistir `traceparent`, `tracestate` e `baggage` W3C junto da mensagem Outbox,
na mesma transação do evento de integração.

O publisher:

- restaura o contexto persistido;
- cria um span `Producer`;
- injeta o contexto desse span nos headers AMQP;
- confirma a publicação antes de concluir o span.

O consumidor:

- extrai os headers e cria um span `Consumer`;
- cria spans `Producer` específicos para retry e dead letter;
- reinjeta o contexto atual em cada republicação;
- registra erro e tags de mensageria sem alterar a regra de idempotência.

As filas de retry continuam retornando diretamente à fila do consumidor, sem
republicar o evento no exchange compartilhado.

## Consequências

- o mesmo `traceId` atravessa requisição, Outbox, RabbitMQ, retries e DLQ;
- reinicializações não interrompem a correlação do trace;
- a Outbox armazena três colunas opcionais adicionais;
- baggage deve conter apenas metadados seguros e de baixa cardinalidade;
- spans podem ser exportados por OTLP sem acoplar os módulos a um fornecedor;
- mensagens antigas, sem contexto persistido, iniciam um novo trace no
  publisher.

## Evidências exigidas

- teste com `traceparent` conhecido que valide o mesmo `traceId` no RabbitMQ;
- teste que valide o mesmo `traceId` após retries e encaminhamento para DLQ;
- ausência de republicação dos retries no exchange público de eventos;
- configuração OTLP opcional e aplicação executável sem collector.

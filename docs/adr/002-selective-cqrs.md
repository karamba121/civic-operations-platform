# ADR-002: uso seletivo de CQRS

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

Separar comandos e consultas pode tornar explícitas as intenções do sistema e
permitir modelos de leitura eficientes. Aplicar toda a infraestrutura de CQRS a
operações administrativas simples, porém, adicionaria handlers, contratos e
indireções sem benefício proporcional.

## Decisão

Utilizar comandos para operações que executam invariantes, produzem eventos ou
precisam de idempotência. Utilizar consultas especializadas para listagens,
dashboards, pesquisa e relatórios.

CRUDs simples podem ser implementados diretamente em serviços de aplicação.
Não haverá event sourcing nem bancos de leitura separados no início.

## Consequências

- o modelo de escrita permanece orientado ao domínio;
- leituras podem projetar diretamente no formato necessário;
- a quantidade de abstrações acompanha a complexidade real;
- os dois estilos coexistirão e exigirão convenções claras.

## Critério de revisão

Uma leitura poderá ganhar projeção persistida quando medições mostrarem que
índices e projeções SQL comuns não atendem aos requisitos.

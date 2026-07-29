# ADR-001: monólito modular como unidade de implantação

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

O domínio possui diferentes bounded contexts, mas o produto começa com uma
equipe, uma cadência de entrega e fortes requisitos de consistência entre os
principais fluxos administrativos.

Transformar cada contexto em serviço independente introduziria comunicação
remota, consistência eventual, versionamento de contratos, mais pipelines e
maior custo de observabilidade antes que existisse uma necessidade operacional.

## Decisão

Adotar um monólito modular com:

- uma unidade principal de implantação;
- módulos com modelos, contratos e schemas próprios;
- dependências validadas por testes de arquitetura;
- proibição de acesso direto aos tipos internos de outro módulo;
- comunicação assíncrona baseada em eventos quando o acoplamento temporal não
  for necessário.

## Consequências

### Positivas

- transações locais nos fluxos que exigem atomicidade;
- execução, depuração e implantação mais simples;
- menor latência e menos modos de falha distribuídos;
- fronteiras de domínio preservadas para uma possível extração futura.

### Negativas

- uma falha grave pode afetar toda a aplicação;
- escala ocorre inicialmente sobre a unidade completa;
- as fronteiras dependem de disciplina e testes automatizados;
- mudanças de banco exigem coordenação entre os módulos.

## Critério de revisão

A decisão será revista quando métricas ou requisitos demonstrarem necessidade
de escala, isolamento, disponibilidade ou cadência independentes.

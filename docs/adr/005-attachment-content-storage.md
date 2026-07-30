# ADR-005: Conteúdo de anexos fora do banco relacional

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

Arquivos binários aumentam backups, replicação, tráfego e tempo de manutenção
do PostgreSQL. Ao mesmo tempo, tenant, solicitação, autor, hash e auditoria são
dados relacionais e precisam participar das regras de consistência do módulo
Requests.

O domínio não deve depender diretamente de filesystem, S3 ou outro fornecedor.

## Decisão

Persistir em `requests.request_attachments` somente:

- tenant, solicitação e usuário que realizou o envio;
- nome original normalizado e content type declarado;
- tamanho em bytes e SHA-256 calculado durante o streaming;
- chave interna de armazenamento;
- data UTC da criação.

O conteúdo será acessado pela porta `IAttachmentContentStore`. A implementação
inicial usa filesystem para manter o desenvolvimento local autocontido. A chave
é gerada pela aplicação com UUIDs e nunca inclui o nome fornecido pelo usuário.

A escrita usa arquivo temporário e rename atômico. O conteúdo é gravado antes
da transação dos metadados; se a transação falhar, a aplicação tenta remover o
objeto como compensação. Apenas depois do conteúdo íntegro ser armazenado são
gravados metadados, auditoria e Outbox.

## Consequências

- o PostgreSQL não armazena bytes do arquivo;
- a porta permite introduzir um adapter S3/MinIO sem alterar domínio ou casos
  de uso;
- backup do banco e backup do conteúdo passam a ter ciclos próprios;
- uma interrupção abrupta entre a gravação do conteúdo e o commit pode deixar
  um objeto órfão;
- será necessário um reconciliador periódico para remover objetos sem
  metadados quando o adapter evoluir para produção;
- autorização, allowlist de tipos e inspeção da assinatura são definidas no
  [ADR-006](006-attachment-security-baseline.md); antimalware permanece como
  evolução posterior.

## Evidências exigidas

- teste contra PostgreSQL real verificando que a tabela contém somente
  metadados;
- verificação do conteúdo no armazenamento externo ao banco;
- download com o mesmo hash e bytes enviados;
- isolamento por tenant;
- auditoria e evento Outbox atômicos para `AttachmentAdded`.

**Rastreabilidade:** armazenamento externo, integridade, isolamento,
autorização e atomicidade estão cobertos por
[RequestAttachmentEndpointTests](../../Backend/tests/CivicOps.Modules.Requests.IntegrationTests/RequestAttachmentEndpointTests.cs)
e pelas regras de domínio em
[RequestAttachmentTests](../../Backend/tests/CivicOps.Modules.Requests.UnitTests/RequestAttachmentTests.cs).

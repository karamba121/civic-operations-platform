# ADR-006: Segurança básica de anexos

- **Status:** aceito
- **Data:** 2026-07-29

## Contexto

O tenant limita a consulta, mas não representa sozinho autorização. Além
disso, extensão e `Content-Type` são informações controladas pelo cliente e
não comprovam o formato real do conteúdo.

O módulo de identidade, papéis e permissões ainda não foi implementado. A
proteção desta fatia precisa ser explícita sem antecipar um sistema artificial
de IAM.

## Decisão

Enquanto não houver permissões por tenant, anexos de uma solicitação podem ser
enviados, listados e baixados somente pelo usuário que criou a solicitação ou
pelo responsável atualmente atribuído.

O autor passa a ser persistido em `administrative_requests`. A migration
recupera o autor de registros existentes pela auditoria `RequestCreated`.
Registros legados sem essa evidência permanecem acessíveis ao responsável.

A API exige `X-Tenant-Id` e `X-User-Id` nas três operações. Esses cabeçalhos
continuam provisórios até a identidade autenticada fornecer tenant e usuário.
Uma solicitação de outro tenant retorna `404`; um usuário sem vínculo dentro do
tenant recebe `403`.

São aceitos somente:

| Extensão | Content-Type | assinatura verificada |
| --- | --- | --- |
| `.pdf` | `application/pdf` | `%PDF-` |
| `.png` | `image/png` | assinatura PNG |
| `.jpg`, `.jpeg` | `image/jpeg` | marcador JPEG |

O tamanho máximo é verificado durante o streaming, sem confiar no tamanho
declarado pelo multipart. O padrão permanece 25 MiB. Arquivos acima do limite
retornam `413`; extensão, MIME ou assinatura inválidos retornam `415`.

## Consequências

- arquivos disfarçados por extensão ou MIME são rejeitados antes da publicação
  definitiva no filesystem;
- arquivos temporários são removidos em qualquer falha de validação;
- a regra de acesso fica no caso de uso e também vale para futuros adapters de
  apresentação;
- papéis por tenant poderão conceder acessos adicionais em uma política
  posterior;
- inspeção antimalware e sanitização aprofundada de PDF continuam fora desta
  etapa e exigirão quarentena antes de disponibilizar o conteúdo.

## Evidências

Testes unitários cobrem combinações permitidas, incompatibilidade de MIME,
assinaturas e acesso do autor/responsável. Testes de integração contra
PostgreSQL real cobrem `403`, `413`, `415`, isolamento entre tenants e remoção
dos arquivos temporários rejeitados.

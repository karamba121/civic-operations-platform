\set ON_ERROR_STOP on
\timing on

DROP SCHEMA IF EXISTS index_benchmark CASCADE;
CREATE SCHEMA index_benchmark;

CREATE TABLE index_benchmark.administrative_requests
(
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    protocol_number varchar(32) NOT NULL,
    title varchar(200) NOT NULL,
    status varchar(32) NOT NULL,
    responsible_user_id uuid NULL,
    due_date_utc timestamptz NULL,
    created_at_utc timestamptz NOT NULL
);

INSERT INTO index_benchmark.administrative_requests
SELECT
    md5(g::text)::uuid,
    (lpad(to_hex(((g - 1) % 20) + 1), 32, '0'))::uuid,
    '2026-' || lpad(g::text, 6, '0'),
    'Solicitacao ' || g,
    (ARRAY['Submitted', 'InProgress', 'Completed', 'Cancelled'])
        [((g - 1) / 20 % 4) + 1],
    CASE
        WHEN ((g - 1) / 20) % 3 = 0 THEN NULL
        ELSE md5(('user-' || (((g - 1) / 20) % 500))::text)::uuid
    END,
    CASE
        WHEN ((g - 1) / 20) % 5 = 0 THEN NULL
        ELSE timestamptz '2026-07-29 12:00:00+00'
            + ((((g - 1) / 20) % 61) - 30) * interval '1 day'
    END,
    timestamptz '2026-01-01 00:00:00+00' + g * interval '1 second'
FROM generate_series(1, 500000) AS g;

CREATE INDEX ix_benchmark_tenant_created
    ON index_benchmark.administrative_requests
        (tenant_id, created_at_utc);
CREATE INDEX ix_benchmark_tenant_status_created
    ON index_benchmark.administrative_requests
        (tenant_id, status, created_at_utc);
CREATE INDEX ix_benchmark_tenant_responsible_status_created
    ON index_benchmark.administrative_requests
        (tenant_id, responsible_user_id, status, created_at_utc);
CREATE INDEX ix_benchmark_tenant_due_date
    ON index_benchmark.administrative_requests
        (tenant_id, due_date_utc);

VACUUM (ANALYZE) index_benchmark.administrative_requests;

\echo 'Plano anterior: métricas operacionais com índice geral de prazo'
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    count(*) FILTER (
        WHERE due_date_utc < timestamptz '2026-07-29 12:00:00+00'
    ) AS overdue,
    count(*) FILTER (
        WHERE due_date_utc >= timestamptz '2026-07-29 12:00:00+00'
          AND due_date_utc <= timestamptz '2026-08-05 12:00:00+00'
    ) AS due_soon,
    count(*) FILTER (
        WHERE responsible_user_id IS NULL
    ) AS unassigned_active
FROM index_benchmark.administrative_requests
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND status IN ('Submitted', 'InProgress');

CREATE INDEX ix_benchmark_tenant_active_due_date
    ON index_benchmark.administrative_requests
        (tenant_id, due_date_utc)
    INCLUDE (responsible_user_id)
    WHERE status = 'Submitted' OR status = 'InProgress';

VACUUM (ANALYZE) index_benchmark.administrative_requests;

\echo 'Plano posterior: métricas operacionais com índice parcial'
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    count(*) FILTER (
        WHERE due_date_utc < timestamptz '2026-07-29 12:00:00+00'
    ) AS overdue,
    count(*) FILTER (
        WHERE due_date_utc >= timestamptz '2026-07-29 12:00:00+00'
          AND due_date_utc <= timestamptz '2026-08-05 12:00:00+00'
    ) AS due_soon,
    count(*) FILTER (
        WHERE responsible_user_id IS NULL
    ) AS unassigned_active
FROM index_benchmark.administrative_requests
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
  AND (status = 'Submitted' OR status = 'InProgress');

\echo 'Validação: totais por situação com índice existente'
EXPLAIN (ANALYZE, BUFFERS)
SELECT status, count(*)
FROM index_benchmark.administrative_requests
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
GROUP BY status;

\echo 'Validação: cinco solicitações recentes com índice existente'
EXPLAIN (ANALYZE, BUFFERS)
SELECT
    id,
    protocol_number,
    title,
    status,
    responsible_user_id,
    due_date_utc,
    created_at_utc
FROM index_benchmark.administrative_requests
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at_utc DESC, id DESC
LIMIT 5;

\echo 'Tamanho dos índices candidatos'
SELECT
    indexrelid::regclass AS index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_index
WHERE indrelid =
    'index_benchmark.administrative_requests'::regclass
ORDER BY indexrelid::regclass::text;

DROP SCHEMA index_benchmark CASCADE;

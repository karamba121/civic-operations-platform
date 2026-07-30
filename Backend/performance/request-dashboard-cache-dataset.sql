\set benchmark_tenant 'ffffffff-ffff-ffff-ffff-ffffffffcace'

DELETE FROM requests.administrative_requests
WHERE tenant_id = :'benchmark_tenant'::uuid;

INSERT INTO requests.administrative_requests (
    id,
    tenant_id,
    created_by_user_id,
    protocol_number,
    title,
    description,
    status,
    responsible_user_id,
    due_date_utc,
    created_at_utc,
    version)
SELECT
    md5('request-dashboard-cache-' || sequence)::uuid,
    :'benchmark_tenant'::uuid,
    NULL,
    '2026-' || lpad(sequence::text, 6, '0'),
    'Solicitação de benchmark ' || sequence,
    'Massa sintética para medir o cache do dashboard.',
    (ARRAY['Submitted', 'InProgress', 'Completed', 'Cancelled'])
        [1 + ((sequence - 1) % 4)],
    CASE
        WHEN sequence % 3 = 0 THEN NULL
        ELSE md5('responsible-' || (sequence % 500))::uuid
    END,
    CASE
        WHEN sequence % 5 = 0 THEN NULL
        ELSE timestamptz '2026-07-29 12:00:00+00'
            + (((sequence % 61) - 30) * interval '1 day')
    END,
    timestamptz '2026-07-29 12:00:00+00'
        - (sequence * interval '1 second'),
    md5('request-dashboard-cache-version-' || sequence)::uuid
FROM generate_series(1, 100000) AS sequence;

VACUUM (ANALYZE) requests.administrative_requests;

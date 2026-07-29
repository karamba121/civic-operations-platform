using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Application.CreateRequest;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class PostgresRequestIdempotencyStore(RequestsDbContext dbContext)
    : IRequestIdempotencyStore
{
    public async Task<IdempotencyReservation> ReserveAsync(
        Guid tenantId,
        string key,
        string requestHash,
        DateTimeOffset createdAtUtc,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(key) || key.Length > 128)
        {
            throw new IdempotencyConflictException(
                "A chave de idempotência deve ter entre 1 e 128 caracteres.");
        }

        var (connection, transaction) = await GetConnectionAsync(cancellationToken);

        await using var insert = connection.CreateCommand();
        insert.Transaction = transaction;
        insert.CommandText =
            """
            INSERT INTO requests.request_idempotency
                (tenant_id, idempotency_key, request_hash, created_at_utc)
            VALUES
                (@tenant_id, @idempotency_key, @request_hash, @created_at_utc)
            ON CONFLICT (tenant_id, idempotency_key) DO NOTHING;
            """;
        AddCommonParameters(insert, tenantId, key);
        insert.Parameters.AddWithValue("request_hash", NpgsqlDbType.Char, requestHash);
        insert.Parameters.AddWithValue(
            "created_at_utc",
            NpgsqlDbType.TimestampTz,
            createdAtUtc);

        if (await insert.ExecuteNonQueryAsync(cancellationToken) == 1)
        {
            return new IdempotencyReservation(true, null);
        }

        await using var select = connection.CreateCommand();
        select.Transaction = transaction;
        select.CommandText =
            """
            SELECT request_hash, request_id
              FROM requests.request_idempotency
             WHERE tenant_id = @tenant_id
               AND idempotency_key = @idempotency_key;
            """;
        AddCommonParameters(select, tenantId, key);

        await using var reader = await select.ExecuteReaderAsync(cancellationToken);

        if (!await reader.ReadAsync(cancellationToken))
        {
            throw new InvalidOperationException(
                "A reserva de idempotência não foi encontrada.");
        }

        var storedHash = reader.GetString(0).TrimEnd();

        if (!string.Equals(storedHash, requestHash, StringComparison.Ordinal))
        {
            throw new IdempotencyConflictException(
                "A chave de idempotência já foi usada com outro conteúdo.");
        }

        if (await reader.IsDBNullAsync(1, cancellationToken))
        {
            throw new InvalidOperationException(
                "A reserva de idempotência não possui uma solicitação associada.");
        }

        return new IdempotencyReservation(false, reader.GetGuid(1));
    }

    public async Task CompleteAsync(
        Guid tenantId,
        string key,
        Guid requestId,
        CancellationToken cancellationToken)
    {
        var (connection, transaction) = await GetConnectionAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText =
            """
            UPDATE requests.request_idempotency
               SET request_id = @request_id
             WHERE tenant_id = @tenant_id
               AND idempotency_key = @idempotency_key;
            """;
        AddCommonParameters(command, tenantId, key);
        command.Parameters.AddWithValue("request_id", NpgsqlDbType.Uuid, requestId);

        if (await command.ExecuteNonQueryAsync(cancellationToken) != 1)
        {
            throw new InvalidOperationException(
                "Não foi possível concluir a reserva de idempotência.");
        }
    }

    private async Task<(NpgsqlConnection Connection, NpgsqlTransaction Transaction)>
        GetConnectionAsync(CancellationToken cancellationToken)
    {
        var currentTransaction = dbContext.Database.CurrentTransaction
            ?? throw new InvalidOperationException(
                "A idempotência exige uma transação ativa.");

        var connection = (NpgsqlConnection)dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        return (
            connection,
            (NpgsqlTransaction)currentTransaction.GetDbTransaction());
    }

    private static void AddCommonParameters(
        NpgsqlCommand command,
        Guid tenantId,
        string key)
    {
        command.Parameters.AddWithValue("tenant_id", NpgsqlDbType.Uuid, tenantId);
        command.Parameters.AddWithValue(
            "idempotency_key",
            NpgsqlDbType.Varchar,
            key);
    }
}

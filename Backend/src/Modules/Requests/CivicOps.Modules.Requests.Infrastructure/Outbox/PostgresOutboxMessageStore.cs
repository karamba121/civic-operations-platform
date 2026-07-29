using CivicOps.Modules.Requests.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace CivicOps.Modules.Requests.Infrastructure.Outbox;

internal sealed class PostgresOutboxMessageStore(RequestsDbContext dbContext)
    : IOutboxMessageStore
{
    public async Task<IReadOnlyCollection<ClaimedOutboxMessage>> ClaimPendingAsync(
        Guid lockId,
        DateTimeOffset nowUtc,
        int batchSize,
        TimeSpan lockDuration,
        CancellationToken cancellationToken)
    {
        await using var transaction =
            await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var connection = await GetOpenConnectionAsync(cancellationToken);

        await using var command = connection.CreateCommand();
        command.Transaction =
            (NpgsqlTransaction)transaction.GetDbTransaction();
        command.CommandText =
            """
            WITH candidates AS
            (
                SELECT id
                  FROM requests.outbox_messages
                 WHERE processed_at_utc IS NULL
                   AND next_attempt_at_utc <= @now_utc
                   AND (locked_until_utc IS NULL OR locked_until_utc < @now_utc)
                 ORDER BY occurred_at_utc, id
                 LIMIT @batch_size
                   FOR UPDATE SKIP LOCKED
            )
            UPDATE requests.outbox_messages AS message
               SET lock_id = @lock_id,
                   locked_until_utc = @locked_until_utc
              FROM candidates
             WHERE message.id = candidates.id
            RETURNING message.id,
                      message.tenant_id,
                message.type,
                message.payload::text,
                message.occurred_at_utc,
                message.trace_parent,
                message.trace_state,
                message.baggage;
            """;
        command.Parameters.AddWithValue("lock_id", NpgsqlDbType.Uuid, lockId);
        command.Parameters.AddWithValue(
            "now_utc",
            NpgsqlDbType.TimestampTz,
            nowUtc);
        command.Parameters.AddWithValue(
            "locked_until_utc",
            NpgsqlDbType.TimestampTz,
            nowUtc.Add(lockDuration));
        command.Parameters.AddWithValue(
            "batch_size",
            NpgsqlDbType.Integer,
            batchSize);

        var messages = new List<ClaimedOutboxMessage>(batchSize);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            messages.Add(
                new ClaimedOutboxMessage(
                    reader.GetGuid(0),
                    reader.GetGuid(1),
                    reader.GetString(2),
                    reader.GetString(3),
                    reader.GetFieldValue<DateTimeOffset>(4),
                    reader.IsDBNull(5) ? null : reader.GetString(5),
                    reader.IsDBNull(6) ? null : reader.GetString(6),
                    reader.IsDBNull(7) ? null : reader.GetString(7)));
        }

        await reader.CloseAsync();
        await transaction.CommitAsync(cancellationToken);
        return messages;
    }

    public Task<bool> MarkProcessedAsync(
        Guid messageId,
        Guid lockId,
        DateTimeOffset processedAtUtc,
        CancellationToken cancellationToken)
    {
        return ExecuteUpdateAsync(
            """
            UPDATE requests.outbox_messages
               SET processed_at_utc = @timestamp_utc,
                   lock_id = NULL,
                   locked_until_utc = NULL,
                   last_error = NULL
             WHERE id = @message_id
               AND lock_id = @lock_id;
            """,
            messageId,
            lockId,
            processedAtUtc,
            null,
            cancellationToken);
    }

    public Task<bool> MarkFailedAsync(
        Guid messageId,
        Guid lockId,
        string error,
        DateTimeOffset nextAttemptAtUtc,
        CancellationToken cancellationToken)
    {
        return ExecuteUpdateAsync(
            """
            UPDATE requests.outbox_messages
               SET attempt_count = attempt_count + 1,
                   last_error = @error,
                   next_attempt_at_utc = @timestamp_utc,
                   lock_id = NULL,
                   locked_until_utc = NULL
             WHERE id = @message_id
               AND lock_id = @lock_id;
            """,
            messageId,
            lockId,
            nextAttemptAtUtc,
            error,
            cancellationToken);
    }

    private async Task<bool> ExecuteUpdateAsync(
        string commandText,
        Guid messageId,
        Guid lockId,
        DateTimeOffset timestampUtc,
        string? error,
        CancellationToken cancellationToken)
    {
        var connection = await GetOpenConnectionAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = commandText;
        command.Parameters.AddWithValue(
            "message_id",
            NpgsqlDbType.Uuid,
            messageId);
        command.Parameters.AddWithValue("lock_id", NpgsqlDbType.Uuid, lockId);
        command.Parameters.AddWithValue(
            "timestamp_utc",
            NpgsqlDbType.TimestampTz,
            timestampUtc);

        if (error is not null)
        {
            command.Parameters.AddWithValue(
                "error",
                NpgsqlDbType.Varchar,
                error);
        }

        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }

    private async Task<NpgsqlConnection> GetOpenConnectionAsync(
        CancellationToken cancellationToken)
    {
        var connection = (NpgsqlConnection)dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        return connection;
    }
}

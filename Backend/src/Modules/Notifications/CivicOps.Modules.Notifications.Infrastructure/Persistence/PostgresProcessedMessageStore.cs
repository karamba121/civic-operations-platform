using CivicOps.Modules.Notifications.Application.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace CivicOps.Modules.Notifications.Infrastructure.Persistence;

internal sealed class PostgresProcessedMessageStore(
    NotificationsDbContext dbContext) : IProcessedMessageStore
{
    public async Task<bool> TryReserveAsync(
        Guid messageId,
        string messageType,
        DateTimeOffset processedAtUtc,
        CancellationToken cancellationToken)
    {
        var transaction = dbContext.Database.CurrentTransaction
            ?? throw new InvalidOperationException(
                "A idempotência do consumidor exige uma transação ativa.");
        var connection = (NpgsqlConnection)dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.Transaction =
            (NpgsqlTransaction)transaction.GetDbTransaction();
        command.CommandText =
            """
            INSERT INTO notifications.processed_messages
                (message_id, message_type, processed_at_utc)
            VALUES
                (@message_id, @message_type, @processed_at_utc)
            ON CONFLICT (message_id) DO NOTHING;
            """;
        command.Parameters.AddWithValue(
            "message_id",
            NpgsqlDbType.Uuid,
            messageId);
        command.Parameters.AddWithValue(
            "message_type",
            NpgsqlDbType.Varchar,
            messageType);
        command.Parameters.AddWithValue(
            "processed_at_utc",
            NpgsqlDbType.TimestampTz,
            processedAtUtc);

        return await command.ExecuteNonQueryAsync(cancellationToken) == 1;
    }
}

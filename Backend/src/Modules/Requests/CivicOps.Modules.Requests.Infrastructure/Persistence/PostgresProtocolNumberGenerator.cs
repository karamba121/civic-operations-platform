using CivicOps.Modules.Requests.Application.Abstractions;
using CivicOps.Modules.Requests.Domain.Requests;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using NpgsqlTypes;
using System.Data;

namespace CivicOps.Modules.Requests.Infrastructure.Persistence;

internal sealed class PostgresProtocolNumberGenerator(RequestsDbContext dbContext)
    : IProtocolNumberGenerator
{
    public async Task<ProtocolNumber> NextAsync(
        Guid tenantId,
        int year,
        CancellationToken cancellationToken)
    {
        var currentTransaction = dbContext.Database.CurrentTransaction
            ?? throw new InvalidOperationException(
                "A geração de protocolo exige uma transação ativa.");

        var connection = (NpgsqlConnection)dbContext.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(cancellationToken);
        }

        await using var command = connection.CreateCommand();
        command.Transaction = (NpgsqlTransaction)currentTransaction.GetDbTransaction();
        command.CommandText =
            """
            INSERT INTO requests.protocol_sequences (tenant_id, year, last_value)
            VALUES (@tenant_id, @year, 1)
            ON CONFLICT (tenant_id, year)
            DO UPDATE
               SET last_value = requests.protocol_sequences.last_value + 1
            RETURNING last_value;
            """;

        command.Parameters.Add(
            new NpgsqlParameter<Guid>("tenant_id", NpgsqlDbType.Uuid)
            {
                TypedValue = tenantId
            });

        command.Parameters.Add(
            new NpgsqlParameter<int>("year", NpgsqlDbType.Integer)
            {
                TypedValue = year
            });

        var scalar = await command.ExecuteScalarAsync(cancellationToken);
        var sequence = Convert.ToInt64(scalar, System.Globalization.CultureInfo.InvariantCulture);

        return ProtocolNumber.Create(year, sequence);
    }
}

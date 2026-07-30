using CivicOps.Modules.IdentityAccess.Infrastructure;
using CivicOps.Modules.Notifications.Infrastructure;
using CivicOps.Modules.Requests.Infrastructure;
using Npgsql;
using System.Data;

internal static class DatabaseMigrationCoordinator
{
    private const long MigrationLockKey = 0x43495649434F5053;

    public static async Task ApplyAsync(
        IServiceProvider serviceProvider,
        CancellationToken cancellationToken = default)
    {
        var configuration =
            serviceProvider.GetRequiredService<IConfiguration>();
        var connectionString =
            configuration.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException(
                "A connection string 'Postgres' não foi configurada.");
        await using var connection = new NpgsqlConnection(connectionString);

        await connection.OpenAsync(cancellationToken);
        var lockAcquired = false;

        try
        {
            await ExecuteLockCommandAsync(
                connection,
                "SELECT pg_advisory_lock(@lock_key);",
                cancellationToken);
            lockAcquired = true;

            await serviceProvider.ApplyIdentityAccessMigrationsAsync();
            await serviceProvider.ApplyRequestsMigrationsAsync(
                cancellationToken);
            await serviceProvider.ApplyNotificationsMigrationsAsync(
                cancellationToken);
        }
        finally
        {
            if (lockAcquired && connection.State == ConnectionState.Open)
            {
                await ExecuteLockCommandAsync(
                    connection,
                    "SELECT pg_advisory_unlock(@lock_key);",
                    CancellationToken.None);
            }
        }
    }

    private static async Task ExecuteLockCommandAsync(
        NpgsqlConnection connection,
        string commandText,
        CancellationToken cancellationToken)
    {
        await using var command = connection.CreateCommand();
        command.CommandText = commandText;

        command.Parameters.AddWithValue("lock_key", MigrationLockKey);

        await command.ExecuteScalarAsync(cancellationToken);
    }
}

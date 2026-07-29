namespace CivicOps.Modules.Requests.Application.CreateRequest;

public sealed class IdempotencyConflictException(string message) : Exception(message);

namespace CivicOps.Modules.Requests.Application.ListRequests;

public sealed class RequestQueryValidationException(string message) : Exception(message);

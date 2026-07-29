namespace CivicOps.BuildingBlocks.Domain;

public sealed class DomainException(string message) : Exception(message);

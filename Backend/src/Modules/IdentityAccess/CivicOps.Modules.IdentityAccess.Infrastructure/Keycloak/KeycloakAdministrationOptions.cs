namespace CivicOps.Modules.IdentityAccess.Infrastructure.Keycloak;

internal sealed class KeycloakAdministrationOptions
{
    public bool Enabled { get; set; }

    public string BaseUrl { get; set; } = string.Empty;

    public string Realm { get; set; } = "civicops";

    public string AdminRealm { get; set; } = "master";

    public string AdminUsername { get; set; } = string.Empty;

    public string AdminPassword { get; set; } = string.Empty;
}

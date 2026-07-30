import { Injectable } from '@angular/core';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import { environment } from '../../../environments/environment';

interface CivicOpsTokenClaims extends KeycloakTokenParsed {
  tenant_id?: string;
  tenant_name?: string;
  platform_admin?: boolean | string;
  name?: string;
  preferred_username?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = new Keycloak(environment.auth);
  private claims: CivicOpsTokenClaims = {};

  async initialize(): Promise<void> {
    const authenticated = await this.keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });

    if (!authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.href,
      });
      return;
    }

    this.keycloak.onTokenExpired = () => {
      void this.ensureValidToken();
    };
    this.synchronizeClaims();
  }

  async ensureValidToken(): Promise<string | null> {
    if (!this.keycloak.authenticated) {
      return null;
    }

    await this.keycloak.updateToken(30);
    this.synchronizeClaims();
    return this.keycloak.token ?? null;
  }

  logout(): Promise<void> {
    return this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  get userId(): string {
    return this.claims.sub ?? '';
  }

  get accessToken(): string | null {
    return this.keycloak.token ?? null;
  }

  get isPlatformAdministrator(): boolean {
    return (
      this.claims.platform_admin === true ||
      this.claims.platform_admin === 'true'
    );
  }
  get tenantId(): string {
    return this.claims.tenant_id ?? '';
  }

  get userName(): string {
    return (
      this.claims.name ??
      this.claims.preferred_username ??
      'Usuário autenticado'
    );
  }

  get tenantName(): string {
    return this.claims.tenant_name ?? 'Tenant autenticado';
  }

  get initials(): string {
    const parts = this.userName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase()).join('') || 'UA';
  }

  private synchronizeClaims(): void {
    this.claims = (this.keycloak.tokenParsed ?? {}) as CivicOpsTokenClaims;
  }
}

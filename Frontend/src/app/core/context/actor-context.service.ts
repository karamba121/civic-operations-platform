import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ActorContextService {
  private readonly auth = inject(AuthService);

  get tenantId(): string {
    return this.auth.tenantId;
  }

  get userId(): string {
    return this.auth.userId;
  }

  get tenantName(): string {
    return this.auth.tenantName;
  }

  get userName(): string {
    return this.auth.userName;
  }

  get initials(): string {
    return this.auth.initials;
  }

  logout(): Promise<void> {
    return this.auth.logout();
  }
}

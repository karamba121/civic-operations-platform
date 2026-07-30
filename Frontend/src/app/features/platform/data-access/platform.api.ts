import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toCivicOpsApiError } from '../../../core/http/civic-ops-api-error';
import {
  CreatePlatformAdministratorPayload,
  CreateTenantPayload,
  CreateTenantUserPayload,
  ManagedUserSummary,
  TenantSummary,
} from './platform.model';

@Injectable({ providedIn: 'root' })
export class PlatformApi {
  private readonly http = inject(HttpClient);
  private readonly platformUrl =
    `${environment.apiBaseUrl}/platform`;
  private readonly tenantUsersUrl =
    `${environment.apiBaseUrl}/access/users`;

  listTenants(): Observable<TenantSummary[]> {
    return this.handle(
      this.http.get<TenantSummary[]>(
        `${this.platformUrl}/tenants`,
      ),
    );
  }

  createTenant(
    payload: CreateTenantPayload,
  ): Observable<TenantSummary> {
    return this.handle(
      this.http.post<TenantSummary>(
        `${this.platformUrl}/tenants`,
        payload,
      ),
    );
  }

  listPlatformAdministrators(): Observable<ManagedUserSummary[]> {
    return this.handle(
      this.http.get<ManagedUserSummary[]>(
        `${this.platformUrl}/administrators`,
      ),
    );
  }

  createPlatformAdministrator(
    payload: CreatePlatformAdministratorPayload,
  ): Observable<ManagedUserSummary> {
    return this.handle(
      this.http.post<ManagedUserSummary>(
        `${this.platformUrl}/administrators`,
        payload,
      ),
    );
  }

  listTenantUsers(): Observable<ManagedUserSummary[]> {
    return this.handle(
      this.http.get<ManagedUserSummary[]>(this.tenantUsersUrl),
    );
  }

  createTenantUser(
    payload: CreateTenantUserPayload,
  ): Observable<ManagedUserSummary> {
    return this.handle(
      this.http.post<ManagedUserSummary>(
        this.tenantUsersUrl,
        payload,
      ),
    );
  }

  private handle<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => toCivicOpsApiError(error)),
      ),
    );
  }
}

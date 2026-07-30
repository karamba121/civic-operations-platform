import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toCivicOpsApiError } from '../../../core/http/civic-ops-api-error';
import { TenantMembership, TenantRole } from './access.model';

@Injectable({ providedIn: 'root' })
export class AccessApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/access`;

  listMembers(): Observable<TenantMembership[]> {
    return this.http
      .get<TenantMembership[]>(`${this.baseUrl}/members`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => toCivicOpsApiError(error)),
        ),
      );
  }

  setMemberRole(
    userId: string,
    role: TenantRole,
  ): Observable<TenantMembership> {
    return this.http
      .put<TenantMembership>(`${this.baseUrl}/members/${userId}`, { role })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => toCivicOpsApiError(error)),
        ),
      );
  }
}

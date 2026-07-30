import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toCivicOpsApiError } from '../../../core/http/civic-ops-api-error';
import { RequestDashboard } from './request-dashboard.model';

@Injectable({ providedIn: 'root' })
export class RequestDashboardApi {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<RequestDashboard> {
    return this.http
      .get<RequestDashboard>(`${environment.apiBaseUrl}/requests/dashboard`)
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => toCivicOpsApiError(error)),
        ),
      );
  }
}

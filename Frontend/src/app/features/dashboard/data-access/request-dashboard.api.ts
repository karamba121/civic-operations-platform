import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProblemDetails } from '../../../core/http/problem-details';
import { RequestDashboard } from './request-dashboard.model';

export class CivicOpsApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ProblemDetails,
  ) {
    super(
      problem.detail ??
        problem.title ??
        'Não foi possível concluir a comunicação com a API.',
    );
  }
}

@Injectable({ providedIn: 'root' })
export class RequestDashboardApi {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<RequestDashboard> {
    return this.http
      .get<RequestDashboard>(`${environment.apiBaseUrl}/requests/dashboard`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const problem =
            error.error && typeof error.error === 'object'
              ? (error.error as ProblemDetails)
              : {};

          return throwError(
            () => new CivicOpsApiError(error.status, problem),
          );
        }),
      );
  }
}

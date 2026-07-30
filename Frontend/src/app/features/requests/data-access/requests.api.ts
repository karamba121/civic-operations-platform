import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toCivicOpsApiError } from '../../../core/http/civic-ops-api-error';
import {
  ListRequestsQuery,
  PagedRequests,
  RequestDetails,
} from './request.model';

@Injectable({ providedIn: 'root' })
export class RequestsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/requests`;

  list(query: ListRequestsQuery): Observable<PagedRequests> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<PagedRequests>(this.baseUrl, { params }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => toCivicOpsApiError(error)),
      ),
    );
  }

  getById(requestId: string): Observable<RequestDetails> {
    return this.http.get<RequestDetails>(`${this.baseUrl}/${requestId}`).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => toCivicOpsApiError(error)),
      ),
    );
  }
}

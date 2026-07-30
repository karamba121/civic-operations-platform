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
  AssignResponsibleInput,
  ChangeRequestStatusInput,
  CreateRequestInput,
  CreateRequestResult,
  ListRequestsQuery,
  PagedRequestAudit,
  PagedRequestComments,
  PagedRequests,
  RequestDetails,
  RequestMutationResult,
  SetRequestDueDateInput,
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

  create(
    input: CreateRequestInput,
    idempotencyKey: string,
  ): Observable<CreateRequestResult> {
    return this.http
      .post<CreateRequestResult>(this.baseUrl, input, {
        headers: { 'Idempotency-Key': idempotencyKey },
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => toCivicOpsApiError(error)),
        ),
      );
  }

  assignResponsible(
    requestId: string,
    input: AssignResponsibleInput,
  ): Observable<RequestMutationResult> {
    return this.patchMutation(requestId, 'assignment', input);
  }

  changeStatus(
    requestId: string,
    input: ChangeRequestStatusInput,
  ): Observable<RequestMutationResult> {
    return this.patchMutation(requestId, 'status', input);
  }

  setDueDate(
    requestId: string,
    input: SetRequestDueDateInput,
  ): Observable<RequestMutationResult> {
    return this.patchMutation(requestId, 'due-date', input);
  }

  listComments(
    requestId: string,
    page: number,
    pageSize = 5,
  ): Observable<PagedRequestComments> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http
      .get<PagedRequestComments>(`${this.baseUrl}/${requestId}/comments`, {
        params,
      })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => toCivicOpsApiError(error)),
        ),
      );
  }

  listAudit(
    requestId: string,
    page: number,
    pageSize = 5,
  ): Observable<PagedRequestAudit> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http
      .get<PagedRequestAudit>(`${this.baseUrl}/${requestId}/audit`, { params })
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => toCivicOpsApiError(error)),
        ),
      );
  }

  private patchMutation(
    requestId: string,
    action: string,
    input:
      | AssignResponsibleInput
      | ChangeRequestStatusInput
      | SetRequestDueDateInput,
  ): Observable<RequestMutationResult> {
    return this.http
      .patch<RequestMutationResult>(
        `${this.baseUrl}/${requestId}/${action}`,
        input,
      )
      .pipe(
        catchError((error: HttpErrorResponse) =>
          throwError(() => toCivicOpsApiError(error)),
        ),
      );
  }
}

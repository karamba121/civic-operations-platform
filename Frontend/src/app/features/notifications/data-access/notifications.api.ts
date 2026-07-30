import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toCivicOpsApiError } from '../../../core/http/civic-ops-api-error';
import { PagedNotifications } from './notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/notifications`;

  list(page: number, pageSize = 10): Observable<PagedNotifications> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedNotifications>(this.baseUrl, { params }).pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => toCivicOpsApiError(error)),
      ),
    );
  }
}

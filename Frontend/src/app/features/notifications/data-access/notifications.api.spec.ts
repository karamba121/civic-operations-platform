import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { civicOpsContextInterceptor } from '../../../core/http/civic-ops-context.interceptor';
import { NotificationsApi } from './notifications.api';

describe(NotificationsApi.name, () => {
  let api: NotificationsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([civicOpsContextInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(NotificationsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists paged notifications for the current context', () => {
    api.list(2).subscribe();

    const request = http.expectOne(
      (candidate) =>
        candidate.url === '/api/v1/notifications' &&
        candidate.params.get('page') === '2' &&
        candidate.params.get('pageSize') === '10',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('X-Tenant-Id')).toBe(
      '11111111-1111-1111-1111-111111111111',
    );
    expect(request.request.headers.get('X-User-Id')).toBe(
      '33333333-3333-3333-3333-333333333333',
    );
    request.flush({
      items: [],
      page: 2,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    });
  });
});

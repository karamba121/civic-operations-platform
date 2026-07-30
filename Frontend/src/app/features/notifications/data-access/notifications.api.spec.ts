import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/auth/auth.service';
import { civicOpsAuthInterceptor } from '../../../core/http/civic-ops-auth.interceptor';
import { NotificationsApi } from './notifications.api';

describe(NotificationsApi.name, () => {
  let api: NotificationsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([civicOpsAuthInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            accessToken: 'test-access-token',
            ensureValidToken: () => Promise.resolve('test-access-token'),
          },
        },
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
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-access-token',
    );
    expect(request.request.headers.has('X-Tenant-Id')).toBeFalse();
    expect(request.request.headers.has('X-User-Id')).toBeFalse();
    request.flush({
      items: [],
      page: 2,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    });
  });
});

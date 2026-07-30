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
import { CivicOpsApiError } from '../../../core/http/civic-ops-api-error';
import { RequestDashboardApi } from './request-dashboard.api';
import { RequestDashboard } from './request-dashboard.model';

describe(RequestDashboardApi.name, () => {
  let api: RequestDashboardApi;
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

    api = TestBed.inject(RequestDashboardApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the dashboard with the authenticated access token', () => {
    const response: RequestDashboard = {
      total: 0,
      submitted: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      overdue: 0,
      dueSoon: 0,
      unassignedActive: 0,
      recent: [],
    };

    api.getDashboard().subscribe((dashboard) => {
      expect(dashboard).toEqual(response);
    });

    const request = http.expectOne('/api/v1/requests/dashboard');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-access-token',
    );
    expect(request.request.headers.has('X-Tenant-Id')).toBeFalse();
    expect(request.request.headers.has('X-User-Id')).toBeFalse();
    request.flush(response);
  });

  it('maps Problem Details responses to a domain API error', () => {
    api.getDashboard().subscribe({
      next: () => fail('expected an error'),
      error: (error: unknown) => {
        expect(error).toBeInstanceOf(CivicOpsApiError);
        expect((error as CivicOpsApiError).message).toBe(
          'Informe um UUID válido no cabeçalho X-Tenant-Id.',
        );
      },
    });

    http.expectOne('/api/v1/requests/dashboard').flush(
      {
        title: 'Tenant inválido',
        detail: 'Informe um UUID válido no cabeçalho X-Tenant-Id.',
        status: 400,
      },
      { status: 400, statusText: 'Bad Request' },
    );
  });
});

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
import { CivicOpsApiError } from '../../../core/http/civic-ops-api-error';
import { RequestDashboardApi } from './request-dashboard.api';
import { RequestDashboard } from './request-dashboard.model';

describe(RequestDashboardApi.name, () => {
  let api: RequestDashboardApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([civicOpsContextInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    api = TestBed.inject(RequestDashboardApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the dashboard with the provisional civic context', () => {
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
    expect(request.request.headers.get('X-Tenant-Id')).toBe(
      '11111111-1111-1111-1111-111111111111',
    );
    expect(request.request.headers.get('X-User-Id')).toBe(
      '33333333-3333-3333-3333-333333333333',
    );
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

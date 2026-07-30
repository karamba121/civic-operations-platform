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
import { PlatformApi } from './platform.api';

describe(PlatformApi.name, () => {
  let api: PlatformApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([civicOpsAuthInterceptor]),
        ),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            accessToken: 'platform-token',
            ensureValidToken: () =>
              Promise.resolve('platform-token'),
          },
        },
      ],
    });
    api = TestBed.inject(PlatformApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates a tenant without sending provisional identity headers', () => {
    const payload = {
      name: 'Prefeitura Exemplo',
      slug: 'prefeitura-exemplo',
      administratorUsername: 'tenant-admin',
      administratorDisplayName: 'Administrador Tenant',
      administratorEmail: 'tenant-admin@example.test',
      administratorPassword: 'tenant_dev_123',
    };

    api.createTenant(payload).subscribe();

    const request = http.expectOne('/api/v1/platform/tenants');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer platform-token',
    );
    expect(request.request.headers.has('X-Tenant-Id')).toBeFalse();
    expect(request.request.headers.has('X-User-Id')).toBeFalse();
    request.flush({
      id: '11111111-1111-1111-1111-111111111111',
      name: payload.name,
      slug: payload.slug,
      isActive: true,
      createdAtUtc: '2026-07-30T00:00:00Z',
    });
  });

  it('creates a user in the authenticated tenant', () => {
    const payload = {
      username: 'operator',
      displayName: 'Operador',
      email: 'operator@example.test',
      password: 'operator_dev_123',
      role: 'Operator' as const,
    };

    api.createTenantUser(payload).subscribe();

    const request = http.expectOne('/api/v1/access/users');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      id: '22222222-2222-2222-2222-222222222222',
      ...payload,
      tenantId: '11111111-1111-1111-1111-111111111111',
      isPlatformAdministrator: false,
      isActive: true,
      createdAtUtc: '2026-07-30T00:00:00Z',
    });
  });
});

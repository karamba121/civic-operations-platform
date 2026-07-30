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
import { AccessApi } from './access.api';

describe(AccessApi.name, () => {
  let api: AccessApi;
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
    api = TestBed.inject(AccessApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists tenant members with the authenticated token', () => {
    api.listMembers().subscribe();

    const request = http.expectOne('/api/v1/access/members');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer test-access-token',
    );
    expect(request.request.headers.has('X-Tenant-Id')).toBeFalse();
    expect(request.request.headers.has('X-User-Id')).toBeFalse();
    request.flush([]);
  });

  it('sets a member role', () => {
    api
      .setMemberRole(
        '22222222-2222-2222-2222-222222222222',
        'Operator',
      )
      .subscribe();

    const request = http.expectOne(
      '/api/v1/access/members/22222222-2222-2222-2222-222222222222',
    );
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ role: 'Operator' });
    request.flush({
      userId: '22222222-2222-2222-2222-222222222222',
      role: 'Operator',
      permissions: ['attachments.read', 'attachments.write'],
      updatedAtUtc: '2026-07-30T02:00:00Z',
    });
  });
});

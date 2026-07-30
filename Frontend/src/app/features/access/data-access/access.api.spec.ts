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
import { AccessApi } from './access.api';

describe(AccessApi.name, () => {
  let api: AccessApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([civicOpsContextInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    api = TestBed.inject(AccessApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists tenant members with actor context', () => {
    api.listMembers().subscribe();

    const request = http.expectOne('/api/v1/access/members');
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('X-Tenant-Id')).toBe(
      '11111111-1111-1111-1111-111111111111',
    );
    expect(request.request.headers.get('X-User-Id')).toBe(
      '33333333-3333-3333-3333-333333333333',
    );
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

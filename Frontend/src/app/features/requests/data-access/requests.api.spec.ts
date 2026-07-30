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
import { RequestsApi } from './requests.api';

describe(RequestsApi.name, () => {
  let api: RequestsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([civicOpsContextInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    api = TestBed.inject(RequestsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends pagination, search, status and tenant context', () => {
    api
      .list({
        page: 2,
        pageSize: 10,
        search: 'iluminação',
        status: 'InProgress',
      })
      .subscribe();

    const request = http.expectOne(
      (candidate) => candidate.url === '/api/v1/requests',
    );

    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('10');
    expect(request.request.params.get('search')).toBe('iluminação');
    expect(request.request.params.get('status')).toBe('InProgress');
    expect(request.request.headers.get('X-Tenant-Id')).toBe(
      '11111111-1111-1111-1111-111111111111',
    );

    request.flush({
      items: [],
      page: 2,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    });
  });

  it('loads a request by id', () => {
    api.getById('request-id').subscribe();

    const request = http.expectOne('/api/v1/requests/request-id');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 'request-id',
      protocolNumber: 'REQ-2026-0001',
      title: 'Iluminação pública',
      description: 'Poste apagado.',
      status: 'Submitted',
      responsibleUserId: null,
      dueDateUtc: null,
      createdAtUtc: '2026-07-30T00:00:00Z',
      version: 'version-id',
    });
  });
});

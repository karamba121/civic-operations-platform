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

  it('creates a request with its idempotency key', () => {
    api
      .create(
        {
          title: 'Iluminação pública',
          description: 'Poste apagado.',
        },
        'stable-idempotency-key',
      )
      .subscribe();

    const request = http.expectOne('/api/v1/requests');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBe(
      'stable-idempotency-key',
    );
    expect(request.request.body).toEqual({
      title: 'Iluminação pública',
      description: 'Poste apagado.',
    });
    request.flush({
      id: 'request-id',
      protocolNumber: 'REQ-2026-0001',
      status: 'Submitted',
      createdAtUtc: '2026-07-30T00:00:00Z',
      version: 'version-id',
    });
  });

  it('sends mutations with the current request version', () => {
    api
      .assignResponsible('request-id', {
        responsibleUserId: '22222222-2222-2222-2222-222222222222',
        version: 'version-1',
      })
      .subscribe();
    api
      .changeStatus('request-id', {
        status: 'InProgress',
        version: 'version-2',
      })
      .subscribe();
    api
      .setDueDate('request-id', {
        dueDateUtc: '2026-08-15T15:00:00.000Z',
        version: 'version-3',
      })
      .subscribe();

    const assignment = http.expectOne(
      '/api/v1/requests/request-id/assignment',
    );
    const status = http.expectOne('/api/v1/requests/request-id/status');
    const dueDate = http.expectOne('/api/v1/requests/request-id/due-date');

    expect(assignment.request.method).toBe('PATCH');
    expect(assignment.request.body).toEqual({
      responsibleUserId: '22222222-2222-2222-2222-222222222222',
      version: 'version-1',
    });
    expect(status.request.method).toBe('PATCH');
    expect(status.request.body).toEqual({
      status: 'InProgress',
      version: 'version-2',
    });
    expect(dueDate.request.method).toBe('PATCH');
    expect(dueDate.request.body).toEqual({
      dueDateUtc: '2026-08-15T15:00:00.000Z',
      version: 'version-3',
    });

    const response = {
      id: 'request-id',
      protocolNumber: 'REQ-2026-0001',
      status: 'InProgress',
      responsibleUserId: '22222222-2222-2222-2222-222222222222',
      dueDateUtc: '2026-08-15T15:00:00.000Z',
      version: 'version-4',
    };
    assignment.flush(response);
    status.flush(response);
    dueDate.flush(response);
  });

  it('loads paged comments and audit records', () => {
    api.listComments('request-id', 2).subscribe();
    api.listAudit('request-id', 3).subscribe();

    const comments = http.expectOne(
      (request) =>
        request.url === '/api/v1/requests/request-id/comments' &&
        request.params.get('page') === '2' &&
        request.params.get('pageSize') === '5',
    );
    const audit = http.expectOne(
      (request) =>
        request.url === '/api/v1/requests/request-id/audit' &&
        request.params.get('page') === '3' &&
        request.params.get('pageSize') === '5',
    );

    expect(comments.request.method).toBe('GET');
    expect(audit.request.method).toBe('GET');

    comments.flush({
      items: [],
      page: 2,
      pageSize: 5,
      totalItems: 0,
      totalPages: 0,
    });
    audit.flush({
      items: [],
      page: 3,
      pageSize: 5,
      totalItems: 0,
      totalPages: 0,
    });
  });

  it('adds a comment to a request', () => {
    api.addComment('request-id', 'Equipe acionada.').subscribe();

    const request = http.expectOne(
      '/api/v1/requests/request-id/comments',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ content: 'Equipe acionada.' });
    request.flush({
      id: 'comment-id',
      authorUserId: '33333333-3333-3333-3333-333333333333',
      content: 'Equipe acionada.',
      createdAtUtc: '2026-07-30T01:00:00Z',
    });
  });

  it('lists, uploads and downloads request attachments', () => {
    const file = new File(['%PDF-1.7'], 'evidence.pdf', {
      type: 'application/pdf',
    });

    api.listAttachments('request-id').subscribe();
    api.uploadAttachment('request-id', file).subscribe();
    api.downloadAttachment('request-id', 'attachment-id').subscribe();

    const list = http.expectOne(
      (request) =>
        request.url === '/api/v1/requests/request-id/attachments' &&
        request.method === 'GET',
    );
    const upload = http.expectOne(
      (request) =>
        request.url === '/api/v1/requests/request-id/attachments' &&
        request.method === 'POST',
    );
    const download = http.expectOne(
      '/api/v1/requests/request-id/attachments/attachment-id/content',
    );

    expect(list.request.method).toBe('GET');
    expect(upload.request.method).toBe('POST');
    expect(upload.request.body instanceof FormData).toBeTrue();
    const uploadedFile = (upload.request.body as FormData).get('file') as File;
    expect(uploadedFile.name).toBe(file.name);
    expect(uploadedFile.type).toBe(file.type);
    expect(uploadedFile.size).toBe(file.size);
    expect(download.request.method).toBe('GET');
    expect(download.request.responseType).toBe('blob');

    const attachment = {
      id: 'attachment-id',
      uploadedByUserId: '33333333-3333-3333-3333-333333333333',
      fileName: 'evidence.pdf',
      contentType: 'application/pdf',
      sizeBytes: file.size,
      sha256: 'hash',
      createdAtUtc: '2026-07-30T02:00:00Z',
    };
    list.flush([attachment]);
    upload.flush(attachment);
    download.flush(new Blob(['%PDF-1.7'], { type: 'application/pdf' }));
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import { RequestDetailsComponent } from './request-details.component';
import { RequestsApi } from './data-access/requests.api';

describe(RequestDetailsComponent.name, () => {
  let fixture: ComponentFixture<RequestDetailsComponent>;
  let getById: jasmine.Spy;
  let listComments: jasmine.Spy;
  let listAudit: jasmine.Spy;
  let assignResponsible: jasmine.Spy;
  let changeStatus: jasmine.Spy;
  let setDueDate: jasmine.Spy;
  let addComment: jasmine.Spy;
  let listAttachments: jasmine.Spy;
  let uploadAttachment: jasmine.Spy;
  let downloadAttachment: jasmine.Spy;

  beforeEach(async () => {
    getById = jasmine.createSpy('getById').and.returnValue(
      of({
        id: 'request-id',
        protocolNumber: 'REQ-2026-0001',
        title: 'Iluminação pública',
        description: 'Poste apagado.',
        status: 'Submitted',
        responsibleUserId: null,
        dueDateUtc: null,
        createdAtUtc: '2026-07-30T00:00:00Z',
        version: 'version-id',
      }),
    );
    listComments = jasmine.createSpy('listComments').and.returnValue(
      of({
        items: [
          {
            id: 'comment-id',
            authorUserId: '33333333-3333-3333-3333-333333333333',
            content: 'Equipe acionada.',
            createdAtUtc: '2026-07-30T01:00:00Z',
          },
        ],
        page: 1,
        pageSize: 5,
        totalItems: 1,
        totalPages: 1,
      }),
    );
    listAudit = jasmine.createSpy('listAudit').and.returnValue(
      of({
        items: [
          {
            id: 'audit-id',
            eventId: 'event-id',
            actorUserId: '33333333-3333-3333-3333-333333333333',
            action: 'RequestCreated',
            data: { protocolNumber: 'REQ-2026-0001' },
            occurredAtUtc: '2026-07-30T00:00:00Z',
          },
        ],
        page: 1,
        pageSize: 5,
        totalItems: 1,
        totalPages: 1,
      }),
    );
    assignResponsible = jasmine
      .createSpy('assignResponsible')
      .and.returnValue(
        of({
          id: 'request-id',
          protocolNumber: 'REQ-2026-0001',
          status: 'Submitted',
          responsibleUserId: '22222222-2222-2222-2222-222222222222',
          dueDateUtc: null,
          version: 'version-2',
        }),
      );
    changeStatus = jasmine.createSpy('changeStatus').and.returnValue(
      of({
        id: 'request-id',
        protocolNumber: 'REQ-2026-0001',
        status: 'InProgress',
        responsibleUserId: '22222222-2222-2222-2222-222222222222',
        dueDateUtc: null,
        version: 'version-3',
      }),
    );
    setDueDate = jasmine.createSpy('setDueDate').and.returnValue(
      of({
        id: 'request-id',
        protocolNumber: 'REQ-2026-0001',
        status: 'InProgress',
        responsibleUserId: '22222222-2222-2222-2222-222222222222',
        dueDateUtc: '2099-08-15T15:00:00.000Z',
        version: 'version-4',
      }),
    );
    addComment = jasmine.createSpy('addComment').and.returnValue(
      of({
        id: 'new-comment-id',
        authorUserId: '33333333-3333-3333-3333-333333333333',
        content: 'Nova atualização.',
        createdAtUtc: '2026-07-30T02:00:00Z',
      }),
    );
    listAttachments = jasmine.createSpy('listAttachments').and.returnValue(
      of([
        {
          id: 'attachment-id',
          uploadedByUserId: '33333333-3333-3333-3333-333333333333',
          fileName: 'evidence.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
          sha256: 'hash',
          createdAtUtc: '2026-07-30T02:00:00Z',
        },
      ]),
    );
    uploadAttachment = jasmine.createSpy('uploadAttachment').and.returnValue(
      of({
        id: 'new-attachment-id',
        uploadedByUserId: '33333333-3333-3333-3333-333333333333',
        fileName: 'new-evidence.pdf',
        contentType: 'application/pdf',
        sizeBytes: 12,
        sha256: 'new-hash',
        createdAtUtc: '2026-07-30T03:00:00Z',
      }),
    );
    downloadAttachment = jasmine
      .createSpy('downloadAttachment')
      .and.returnValue(of(new Blob(['%PDF-1.7'])));

    await TestBed.configureTestingModule({
      imports: [RequestDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'request-id' }),
              queryParamMap: convertToParamMap({ criada: '1' }),
            },
          },
        },
        {
          provide: RequestsApi,
          useValue: {
            getById,
            listComments,
            listAudit,
            assignResponsible,
            changeStatus,
            setDueDate,
            addComment,
            listAttachments,
            uploadAttachment,
            downloadAttachment,
          },
        },
      ],
    }).compileComponents();
  });

  it('renders protocol, comments and audit', () => {
    fixture = TestBed.createComponent(RequestDetailsComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Solicitação registrada com sucesso');
    expect(text).toContain('REQ-2026-0001');
    expect(text).toContain('Equipe acionada.');
    expect(text).toContain('evidence.pdf');
    expect(text).toContain('Solicitação registrada');
    expect(getById).toHaveBeenCalledWith('request-id');
    expect(listComments).toHaveBeenCalledWith('request-id', 1);
    expect(listAttachments).toHaveBeenCalledWith('request-id');
    expect(listAudit).toHaveBeenCalledWith('request-id', 1);
  });

  it('adds a comment and refreshes comments and audit', () => {
    fixture = TestBed.createComponent(RequestDetailsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    listComments.calls.reset();
    listAudit.calls.reset();

    component.commentContent = '  Nova atualização.  ';
    component.addComment(new Event('submit'));

    expect(addComment).toHaveBeenCalledWith(
      'request-id',
      'Nova atualização.',
    );
    expect(component.commentContent).toBe('');
    expect(component.commentSuccess).toContain('sucesso');
    expect(listComments).toHaveBeenCalledWith('request-id', 1);
    expect(listAudit).toHaveBeenCalledWith('request-id', 1);
  });

  it('uploads a valid attachment and adds it to the list', () => {
    fixture = TestBed.createComponent(RequestDetailsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const file = new File(['%PDF-1.7'], 'new-evidence.pdf', {
      type: 'application/pdf',
    });

    component.selectedAttachment = file;
    component.uploadAttachment(new Event('submit'));

    expect(uploadAttachment).toHaveBeenCalledWith('request-id', file);
    expect(component.attachments?.[0].fileName).toBe('new-evidence.pdf');
    expect(component.selectedAttachment).toBeNull();
    expect(component.attachmentSuccess).toContain('sucesso');
  });

  it('uses the latest version across assignment, status and due date updates', () => {
    fixture = TestBed.createComponent(RequestDetailsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.responsibleUserId =
      '22222222-2222-2222-2222-222222222222';
    component.assignResponsible(new Event('submit'));
    component.selectedStatus = 'InProgress';
    component.changeStatus(new Event('submit'));
    component.dueDateLocal = '2099-08-15T12:00';
    component.saveDueDate(new Event('submit'));

    expect(assignResponsible).toHaveBeenCalledWith('request-id', {
      responsibleUserId: '22222222-2222-2222-2222-222222222222',
      version: 'version-id',
    });
    expect(changeStatus).toHaveBeenCalledWith('request-id', {
      status: 'InProgress',
      version: 'version-2',
    });
    expect(setDueDate).toHaveBeenCalledWith(
      'request-id',
      jasmine.objectContaining({ version: 'version-3' }),
    );
    expect(component.request?.version).toBe('version-4');
    expect(component.successMessage).toBe('Prazo atualizado com sucesso.');
  });

  it('reloads the latest data when an update has a concurrency conflict', () => {
    assignResponsible.and.returnValue(
      throwError(
        () =>
          new CivicOpsApiError(409, {
            title: 'Conflito de concorrência',
          }),
      ),
    );
    fixture = TestBed.createComponent(RequestDetailsComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.responsibleUserId =
      '22222222-2222-2222-2222-222222222222';
    component.assignResponsible(new Event('submit'));

    expect(getById).toHaveBeenCalledTimes(2);
    expect(component.conflictMessage).toContain('Outra pessoa alterou');
    expect(component.successMessage).toBe('');
  });

  for (const scenario of [
    { status: 403, message: 'não tem permissão' },
    { status: 413, message: 'limite de 25 MB' },
    { status: 415, message: 'Formato não permitido' },
  ]) {
    it(`explains attachment upload error ${scenario.status}`, () => {
      uploadAttachment.and.returnValue(
        throwError(
          () =>
            new CivicOpsApiError(scenario.status, {
              title: 'Falha no anexo',
            }),
        ),
      );
      fixture = TestBed.createComponent(RequestDetailsComponent);
      fixture.detectChanges();
      const component = fixture.componentInstance;
      component.selectedAttachment = new File(
        ['%PDF-1.7'],
        'evidence.pdf',
        { type: 'application/pdf' },
      );

      component.uploadAttachment(new Event('submit'));

      expect(component.attachmentUploadError).toContain(scenario.message);
    });
  }
});

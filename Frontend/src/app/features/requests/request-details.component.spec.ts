import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RequestDetailsComponent } from './request-details.component';
import { RequestsApi } from './data-access/requests.api';

describe(RequestDetailsComponent.name, () => {
  let fixture: ComponentFixture<RequestDetailsComponent>;
  let getById: jasmine.Spy;
  let listComments: jasmine.Spy;
  let listAudit: jasmine.Spy;

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
          useValue: { getById, listComments, listAudit },
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
    expect(text).toContain('Solicitação registrada');
    expect(getById).toHaveBeenCalledWith('request-id');
    expect(listComments).toHaveBeenCalledWith('request-id', 1);
    expect(listAudit).toHaveBeenCalledWith('request-id', 1);
  });
});

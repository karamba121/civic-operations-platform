import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { NotificationsApi } from './data-access/notifications.api';
import { NotificationsCenterComponent } from './notifications-center.component';

describe(NotificationsCenterComponent.name, () => {
  let fixture: ComponentFixture<NotificationsCenterComponent>;
  let list: jasmine.Spy;

  beforeEach(async () => {
    list = jasmine.createSpy('list').and.returnValue(
      of({
        items: [
          {
            id: 'notification-id',
            requestId: 'request-id',
            protocolNumber: 'REQ-2026-0001',
            type: 'RequestAssigned',
            title: 'Nova solicitação atribuída',
            content: 'Você agora é responsável por esta solicitação.',
            createdAtUtc: '2026-07-30T02:00:00Z',
          },
        ],
        page: 2,
        pageSize: 10,
        totalItems: 11,
        totalPages: 2,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [NotificationsCenterComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ page: '2' })),
          },
        },
        { provide: NotificationsApi, useValue: { list } },
      ],
    }).compileComponents();
  });

  it('renders notifications linked to their request', () => {
    fixture = TestBed.createComponent(NotificationsCenterComponent);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Nova solicitação atribuída');
    expect(element.textContent).toContain('REQ-2026-0001');
    expect(
      element.querySelector('a')?.getAttribute('href'),
    ).toBe('/solicitacoes/request-id');
    expect(list).toHaveBeenCalledWith(2);
  });
});

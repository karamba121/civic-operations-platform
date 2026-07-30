import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { PagedRequests } from './data-access/request.model';
import { RequestsApi } from './data-access/requests.api';
import { RequestsListComponent } from './requests-list.component';

describe(RequestsListComponent.name, () => {
  let fixture: ComponentFixture<RequestsListComponent>;
  let list: jasmine.Spy;

  beforeEach(async () => {
    list = jasmine.createSpy('list');

    await TestBed.configureTestingModule({
      imports: [RequestsListComponent],
      providers: [
        provideRouter([]),
        {
          provide: RequestsApi,
          useValue: { list },
        },
      ],
    }).compileComponents();
  });

  it('loads and renders a request linked to its detail', () => {
    const result: PagedRequests = {
      items: [
        {
          id: 'request-id',
          protocolNumber: 'REQ-2026-0001',
          title: 'Manutenção da iluminação pública',
          status: 'Submitted',
          responsibleUserId: null,
          dueDateUtc: null,
          createdAtUtc: '2026-07-30T00:00:00Z',
          version: 'version-id',
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    };
    list.and.returnValue(of(result));

    fixture = TestBed.createComponent(RequestsListComponent);
    fixture.detectChanges();

    expect(list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      search: undefined,
      status: undefined,
    });
    expect(fixture.nativeElement.textContent).toContain('REQ-2026-0001');
    expect(
      fixture.nativeElement.querySelector(
        'a[href="/solicitacoes/request-id"]',
      ),
    ).not.toBeNull();
  });

  it('updates the URL when a status is selected', () => {
    list.and.returnValue(
      of({
        items: [],
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(RequestsListComponent);
    fixture.detectChanges();

    const select: HTMLSelectElement =
      fixture.nativeElement.querySelector('select');
    select.value = 'InProgress';
    select.dispatchEvent(new Event('change'));

    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: jasmine.anything(),
      queryParams: { status: 'InProgress', page: 1 },
      queryParamsHandling: 'merge',
    });
  });

  it('debounces search before updating the URL', fakeAsync(() => {
    list.and.returnValue(
      of({
        items: [],
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(RequestsListComponent);
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="search"]');
    input.value = 'iluminação';
    input.dispatchEvent(new Event('input'));
    tick(349);
    expect(router.navigate).not.toHaveBeenCalled();

    tick(1);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: jasmine.anything(),
      queryParams: { search: 'iluminação', page: 1 },
      queryParamsHandling: 'merge',
    });
  }));
});

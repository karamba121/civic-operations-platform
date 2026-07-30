import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import { RequestCreateComponent } from './request-create.component';
import { RequestsApi } from './data-access/requests.api';

describe(RequestCreateComponent.name, () => {
  let fixture: ComponentFixture<RequestCreateComponent>;
  let create: jasmine.Spy;

  beforeEach(async () => {
    create = jasmine.createSpy('create');

    await TestBed.configureTestingModule({
      imports: [RequestCreateComponent],
      providers: [
        provideRouter([]),
        {
          provide: RequestsApi,
          useValue: { create },
        },
      ],
    }).compileComponents();
  });

  it('validates required fields before calling the API', () => {
    fixture = TestBed.createComponent(RequestCreateComponent);
    fixture.detectChanges();

    fixture.componentInstance.submit(new Event('submit'));
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Informe o título da solicitação.',
    );
  });

  it('reuses the idempotency key when the same submission is retried', () => {
    create.and.returnValue(
      throwError(
        () =>
          new CivicOpsApiError(503, {
            detail: 'Serviço temporariamente indisponível.',
          }),
      ),
    );
    fixture = TestBed.createComponent(RequestCreateComponent);
    fixture.componentInstance.title = 'Iluminação pública';
    fixture.componentInstance.description = 'Poste apagado.';

    fixture.componentInstance.submit(new Event('submit'));
    fixture.componentInstance.submit(new Event('submit'));

    expect(create).toHaveBeenCalledTimes(2);
    expect(create.calls.argsFor(0)[1]).toBe(create.calls.argsFor(1)[1]);
  });

  it('navigates to the generated protocol after success', () => {
    create.and.returnValue(
      of({
        id: 'request-id',
        protocolNumber: 'REQ-2026-0001',
        status: 'Submitted',
        createdAtUtc: '2026-07-30T00:00:00Z',
        version: 'version-id',
      }),
    );
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(RequestCreateComponent);
    fixture.componentInstance.title = 'Iluminação pública';
    fixture.componentInstance.description = 'Poste apagado.';

    fixture.componentInstance.submit(new Event('submit'));

    expect(router.navigate).toHaveBeenCalledWith(
      ['/solicitacoes', 'request-id'],
      { queryParams: { criada: '1' } },
    );
  });
});

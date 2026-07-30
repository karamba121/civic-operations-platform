import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import {
  CivicOpsApiError,
  RequestDashboardApi,
} from './data-access/request-dashboard.api';
import { RequestDashboard } from './data-access/request-dashboard.model';
import { DashboardComponent } from './dashboard.component';

describe(DashboardComponent.name, () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let getDashboard: jasmine.Spy;

  const emptyDashboard: RequestDashboard = {
    total: 0,
    submitted: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    dueSoon: 0,
    unassignedActive: 0,
    recent: [],
  };

  beforeEach(async () => {
    getDashboard = jasmine
      .createSpy('getDashboard')
      .and.returnValue(of(emptyDashboard));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        {
          provide: RequestDashboardApi,
          useValue: { getDashboard },
        },
      ],
    }).compileComponents();
  });

  it('renders the empty operational state', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Nenhuma solicitação registrada',
    );
    expect(getDashboard).toHaveBeenCalledTimes(1);
  });

  it('renders the detail returned by Problem Details', () => {
    getDashboard.and.returnValue(
      throwError(
        () =>
          new CivicOpsApiError(503, {
            title: 'Serviço indisponível',
            detail: 'A consulta está temporariamente indisponível.',
          }),
      ),
    );

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'A consulta está temporariamente indisponível.',
    );
  });
});

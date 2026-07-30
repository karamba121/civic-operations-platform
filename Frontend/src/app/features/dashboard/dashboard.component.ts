import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CivicOpsApiError,
  RequestDashboardApi,
} from './data-access/request-dashboard.api';
import {
  RequestDashboard,
  RequestStatus,
} from './data-access/request-dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(RequestDashboardApi);
  private readonly destroyRef = inject(DestroyRef);

  dashboard: RequestDashboard | null = null;
  loading = true;
  errorMessage = '';
  lastUpdatedAt: Date | null = null;

  readonly statusLabels: Record<RequestStatus, string> = {
    Submitted: 'Recebida',
    InProgress: 'Em andamento',
    Completed: 'Concluída',
    Cancelled: 'Cancelada',
  };

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api
      .getDashboard()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (dashboard) => {
          this.dashboard = dashboard;
          this.lastUpdatedAt = new Date();
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof CivicOpsApiError
              ? error.message
              : 'Não foi possível carregar os indicadores. Tente novamente.';
        },
      });
  }

  statusClasses(status: RequestStatus): string {
    const classes: Record<RequestStatus, string> = {
      Submitted:
        'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400',
      InProgress:
        'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400',
      Completed:
        'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400',
      Cancelled:
        'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300',
    };

    return classes[status];
  }
}

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import { PagedNotifications } from './data-access/notification.model';
import { NotificationsApi } from './data-access/notifications.api';

@Component({
  selector: 'app-notifications-center',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './notifications-center.component.html',
})
export class NotificationsCenterComponent implements OnInit {
  private readonly api = inject(NotificationsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  result: PagedNotifications | null = null;
  page = 1;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.page = this.parsePage(params.get('page'));
        this.load();
      });
  }

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > (this.result?.totalPages ?? 1) ||
      page === this.page
    ) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  retry(): void {
    this.load();
  }

  typeLabel(type: string): string {
    const labels: Record<string, string> = {
      RequestAssigned: 'Nova atribuição',
      'request-assigned': 'Nova atribuição',
    };
    return labels[type] ?? 'Atualização';
  }

  private load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api
      .list(this.page)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (result) => {
          this.result = result;
          if (result.totalPages > 0 && this.page > result.totalPages) {
            this.goToPage(result.totalPages);
          }
        },
        error: (error: unknown) => {
          this.result = null;
          this.errorMessage =
            error instanceof CivicOpsApiError
              ? error.message
              : 'Não foi possível carregar as notificações.';
        },
      });
  }

  private parsePage(value: string | null): number {
    const page = Number(value);
    return Number.isInteger(page) && page > 0 ? page : 1;
  }
}

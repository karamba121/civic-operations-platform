import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  Subject,
} from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import {
  PagedRequests,
  RequestStatus,
} from './data-access/request.model';
import { RequestsApi } from './data-access/requests.api';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const REQUEST_STATUSES: RequestStatus[] = [
  'Submitted',
  'InProgress',
  'Completed',
  'Cancelled',
];

@Component({
  selector: 'app-requests-list',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './requests-list.component.html',
})
export class RequestsListComponent implements OnInit {
  private readonly api = inject(RequestsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<string>();

  result: PagedRequests | null = null;
  search = '';
  status: RequestStatus | '' = '';
  page = 1;
  pageSize = DEFAULT_PAGE_SIZE;
  loading = true;
  errorMessage = '';

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly statuses = REQUEST_STATUSES;
  readonly statusLabels: Record<RequestStatus, string> = {
    Submitted: 'Recebida',
    InProgress: 'Em andamento',
    Completed: 'Concluída',
    Cancelled: 'Cancelada',
  };

  ngOnInit(): void {
    this.searchChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((search) => {
        void this.updateQuery({ search: search || null, page: 1 });
      });

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.search = params.get('search')?.trim() ?? '';
        this.status = this.parseStatus(params.get('status'));
        this.page = this.parsePositiveInteger(params.get('page'), 1);
        this.pageSize = this.parsePageSize(params.get('pageSize'));
        this.load();
      });
  }

  onSearchInput(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
    this.searchChanges.next(this.search.trim());
  }

  onStatusChange(event: Event): void {
    const status = this.parseStatus((event.target as HTMLSelectElement).value);
    void this.updateQuery({ status: status || null, page: 1 });
  }

  onPageSizeChange(event: Event): void {
    const pageSize = this.parsePageSize(
      (event.target as HTMLSelectElement).value,
    );
    void this.updateQuery({
      pageSize: pageSize === DEFAULT_PAGE_SIZE ? null : pageSize,
      page: 1,
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > (this.result?.totalPages ?? 1) || page === this.page) {
      return;
    }

    void this.updateQuery({ page: page === 1 ? null : page });
  }

  clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: null,
        status: null,
        page: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  retry(): void {
    this.load();
  }

  get hasFilters(): boolean {
    return Boolean(this.search || this.status);
  }

  get rangeStart(): number {
    return this.result?.totalItems
      ? (this.result.page - 1) * this.result.pageSize + 1
      : 0;
  }

  get rangeEnd(): number {
    if (!this.result) {
      return 0;
    }

    return Math.min(
      this.result.page * this.result.pageSize,
      this.result.totalItems,
    );
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

  private load(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api
      .list({
        page: this.page,
        pageSize: this.pageSize,
        search: this.search || undefined,
        status: this.status || undefined,
      })
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
              : 'Não foi possível carregar as solicitações. Tente novamente.';
        },
      });
  }

  private updateQuery(
    queryParams: Record<string, string | number | null>,
  ): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  private parseStatus(value: string | null): RequestStatus | '' {
    return REQUEST_STATUSES.includes(value as RequestStatus)
      ? (value as RequestStatus)
      : '';
  }

  private parsePageSize(value: string | null): number {
    const parsed = Number(value);
    return PAGE_SIZE_OPTIONS.includes(
      parsed as (typeof PAGE_SIZE_OPTIONS)[number],
    )
      ? parsed
      : DEFAULT_PAGE_SIZE;
  }

  private parsePositiveInteger(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }
}

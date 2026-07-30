import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import {
  RequestDetails,
  RequestStatus,
} from './data-access/request.model';
import { RequestsApi } from './data-access/requests.api';

@Component({
  selector: 'app-request-details',
  imports: [DatePipe, RouterLink],
  templateUrl: './request-details.component.html',
})
export class RequestDetailsComponent implements OnInit {
  private readonly api = inject(RequestsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  request: RequestDetails | null = null;
  loading = true;
  errorMessage = '';

  readonly statusLabels: Record<RequestStatus, string> = {
    Submitted: 'Recebida',
    InProgress: 'Em andamento',
    Completed: 'Concluída',
    Cancelled: 'Cancelada',
  };

  ngOnInit(): void {
    this.load();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (!requestId) {
      this.errorMessage = 'Identificador da solicitação não informado.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.api
      .getById(requestId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (request) => (this.request = request),
        error: (error: unknown) => {
          this.request = null;
          this.errorMessage =
            error instanceof CivicOpsApiError
              ? error.message
              : 'Não foi possível carregar a solicitação.';
        },
      });
  }
}

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import {
  PagedRequestAudit,
  PagedRequestComments,
  RequestAuditRecord,
  RequestDetails,
  RequestStatus,
} from './data-access/request.model';
import { RequestsApi } from './data-access/requests.api';

@Component({
  selector: 'app-request-details',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './request-details.component.html',
})
export class RequestDetailsComponent implements OnInit {
  private readonly api = inject(RequestsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  request: RequestDetails | null = null;
  comments: PagedRequestComments | null = null;
  audit: PagedRequestAudit | null = null;
  loading = true;
  commentsLoading = true;
  auditLoading = true;
  errorMessage = '';
  commentsError = '';
  auditError = '';
  readonly wasCreated = this.route.snapshot.queryParamMap.get('criada') === '1';

  readonly statusLabels: Record<RequestStatus, string> = {
    Submitted: 'Recebida',
    InProgress: 'Em andamento',
    Completed: 'Concluída',
    Cancelled: 'Cancelada',
  };

  private readonly auditLabels: Record<string, string> = {
    RequestCreated: 'Solicitação registrada',
    ResponsibleAssigned: 'Responsável atribuído',
    StatusChanged: 'Situação alterada',
    DueDateChanged: 'Prazo alterado',
    CommentAdded: 'Comentário adicionado',
    AttachmentAdded: 'Anexo adicionado',
  };

  ngOnInit(): void {
    this.loadDetails();
    this.loadComments(1);
    this.loadAudit(1);
  }

  retry(): void {
    this.loadDetails();
  }

  loadComments(page: number): void {
    const requestId = this.requestId;
    if (!requestId) {
      return;
    }

    this.commentsLoading = true;
    this.commentsError = '';
    this.api
      .listComments(requestId, page)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.commentsLoading = false)),
      )
      .subscribe({
        next: (comments) => (this.comments = comments),
        error: (error: unknown) => {
          this.commentsError = this.errorText(
            error,
            'Não foi possível carregar os comentários.',
          );
        },
      });
  }

  loadAudit(page: number): void {
    const requestId = this.requestId;
    if (!requestId) {
      return;
    }

    this.auditLoading = true;
    this.auditError = '';
    this.api
      .listAudit(requestId, page)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.auditLoading = false)),
      )
      .subscribe({
        next: (audit) => (this.audit = audit),
        error: (error: unknown) => {
          this.auditError = this.errorText(
            error,
            'Não foi possível carregar a auditoria.',
          );
        },
      });
  }

  shortUser(userId: string): string {
    return `Usuário ${userId.slice(0, 8)}`;
  }

  auditLabel(action: string): string {
    return this.auditLabels[action] ?? action;
  }

  auditSummary(record: RequestAuditRecord): string {
    const data = record.data;
    switch (record.action) {
      case 'RequestCreated':
        return `Protocolo ${String(data['protocolNumber'] ?? '')}`;
      case 'ResponsibleAssigned':
        return `Responsável ${this.shortUser(
          String(data['responsibleUserId'] ?? ''),
        )}`;
      case 'StatusChanged': {
        const previous = this.statusLabel(data['previousStatus']);
        const current = this.statusLabel(data['status']);
        return `${previous} → ${current}`;
      }
      case 'DueDateChanged':
        return data['dueDateUtc'] ? 'Novo prazo definido' : 'Prazo removido';
      case 'CommentAdded':
        return 'Novo registro incluído na conversa';
      case 'AttachmentAdded':
        return `Arquivo ${String(data['fileName'] ?? '')}`;
      default:
        return 'Evento registrado no histórico';
    }
  }

  private loadDetails(): void {
    const requestId = this.requestId;
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
          this.errorMessage = this.errorText(
            error,
            'Não foi possível carregar a solicitação.',
          );
        },
      });
  }

  private get requestId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  private errorText(error: unknown, fallback: string): string {
    return error instanceof CivicOpsApiError ? error.message : fallback;
  }

  private statusLabel(value: unknown): string {
    return this.statusLabels[value as RequestStatus] ?? String(value ?? '');
  }
}

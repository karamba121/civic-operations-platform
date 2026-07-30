import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import {
  PagedRequestAudit,
  PagedRequestComments,
  RequestAuditRecord,
  RequestDetails,
  RequestMutationResult,
  RequestStatus,
} from './data-access/request.model';
import { RequestsApi } from './data-access/requests.api';

type MutationKind = 'assignment' | 'status' | 'dueDate';

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
  responsibleUserId = '';
  selectedStatus: RequestStatus | '' = '';
  dueDateLocal = '';
  assignmentError = '';
  statusError = '';
  dueDateError = '';
  successMessage = '';
  conflictMessage = '';
  activeMutation: MutationKind | null = null;
  refreshingAfterConflict = false;
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

  private readonly transitions: Partial<
    Record<RequestStatus, RequestStatus[]>
  > = {
    Submitted: ['InProgress', 'Cancelled'],
    InProgress: ['Completed', 'Cancelled'],
  };

  ngOnInit(): void {
    this.loadDetails();
    this.loadComments(1);
    this.loadAudit(1);
  }

  retry(): void {
    this.loadDetails();
  }

  onResponsibleInput(event: Event): void {
    this.responsibleUserId = (event.target as HTMLInputElement).value.trim();
    this.assignmentError = '';
    this.clearFeedback();
  }

  onStatusChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement)
      .value as RequestStatus;
    this.statusError = '';
    this.clearFeedback();
  }

  onDueDateInput(event: Event): void {
    this.dueDateLocal = (event.target as HTMLInputElement).value;
    this.dueDateError = '';
    this.clearFeedback();
  }

  assignResponsible(event: Event): void {
    event.preventDefault();
    if (!this.request || !this.isValidUuid(this.responsibleUserId)) {
      this.assignmentError = 'Informe um identificador de usuário válido.';
      return;
    }

    this.runMutation(
      'assignment',
      this.api.assignResponsible(this.request.id, {
        responsibleUserId: this.responsibleUserId,
        version: this.request.version,
      }),
      'Responsável atualizado com sucesso.',
    );
  }

  changeStatus(event: Event): void {
    event.preventDefault();
    if (
      !this.request ||
      !this.selectedStatus ||
      !this.availableStatuses.includes(this.selectedStatus)
    ) {
      this.statusError = 'Selecione uma situação permitida para esta etapa.';
      return;
    }

    this.runMutation(
      'status',
      this.api.changeStatus(this.request.id, {
        status: this.selectedStatus,
        version: this.request.version,
      }),
      'Situação atualizada com sucesso.',
    );
  }

  saveDueDate(event: Event): void {
    event.preventDefault();
    if (!this.request || !this.dueDateLocal) {
      this.dueDateError = 'Informe uma data e hora para o prazo.';
      return;
    }

    const dueDate = new Date(this.dueDateLocal);
    if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) {
      this.dueDateError = 'O prazo deve ser uma data e hora futuras.';
      return;
    }

    this.updateDueDate(dueDate.toISOString(), 'Prazo atualizado com sucesso.');
  }

  clearDueDate(): void {
    if (!this.request?.dueDateUtc) {
      return;
    }

    this.updateDueDate(null, 'Prazo removido com sucesso.');
  }

  isMutating(kind: MutationKind): boolean {
    return this.activeMutation === kind;
  }

  get availableStatuses(): RequestStatus[] {
    return this.request ? (this.transitions[this.request.status] ?? []) : [];
  }

  get isTerminal(): boolean {
    return (
      this.request?.status === 'Completed' ||
      this.request?.status === 'Cancelled'
    );
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

  private loadDetails(afterConflict = false): void {
    const requestId = this.requestId;
    if (!requestId) {
      this.errorMessage = 'Identificador da solicitação não informado.';
      this.loading = false;
      return;
    }

    if (afterConflict) {
      this.refreshingAfterConflict = true;
    } else {
      this.loading = true;
      this.errorMessage = '';
    }
    this.api
      .getById(requestId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.refreshingAfterConflict = false;
        }),
      )
      .subscribe({
        next: (request) => {
          this.request = request;
          this.synchronizeActionFields();
        },
        error: (error: unknown) => {
          if (afterConflict) {
            this.conflictMessage =
              'Os dados mudaram, mas não foi possível carregar a versão mais recente. Atualize a página antes de tentar novamente.';
          } else {
            this.request = null;
            this.errorMessage = this.errorText(
              error,
              'Não foi possível carregar a solicitação.',
            );
          }
        },
      });
  }

  private updateDueDate(
    dueDateUtc: string | null,
    successMessage: string,
  ): void {
    if (!this.request) {
      return;
    }

    this.runMutation(
      'dueDate',
      this.api.setDueDate(this.request.id, {
        dueDateUtc,
        version: this.request.version,
      }),
      successMessage,
    );
  }

  private runMutation(
    kind: MutationKind,
    mutation: Observable<RequestMutationResult>,
    successMessage: string,
  ): void {
    if (this.activeMutation) {
      return;
    }

    this.activeMutation = kind;
    this.clearErrors();
    this.clearFeedback();

    mutation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.activeMutation = null)),
      )
      .subscribe({
        next: (result) => {
          this.applyMutation(result);
          this.successMessage = successMessage;
          this.loadAudit(1);
        },
        error: (error: unknown) => {
          if (error instanceof CivicOpsApiError && error.status === 409) {
            this.conflictMessage =
              'Outra pessoa alterou esta solicitação. Os dados mais recentes foram carregados; revise as informações antes de tentar novamente.';
            this.loadDetails(true);
            this.loadAudit(1);
            return;
          }

          this.setMutationError(
            kind,
            this.errorText(error, 'Não foi possível salvar a alteração.'),
          );
        },
      });
  }

  private applyMutation(result: RequestMutationResult): void {
    if (!this.request) {
      return;
    }

    this.request = {
      ...this.request,
      status: result.status,
      responsibleUserId: result.responsibleUserId,
      dueDateUtc: result.dueDateUtc,
      version: result.version,
    };
    this.synchronizeActionFields();
  }

  private synchronizeActionFields(): void {
    if (!this.request) {
      return;
    }

    this.responsibleUserId = this.request.responsibleUserId ?? '';
    this.selectedStatus = '';
    this.dueDateLocal = this.toLocalDateTime(this.request.dueDateUtc);
  }

  private toLocalDateTime(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const pad = (part: number) => String(part).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private isValidUuid(value: string): boolean {
    return (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value,
      ) && value !== '00000000-0000-0000-0000-000000000000'
    );
  }

  private setMutationError(kind: MutationKind, message: string): void {
    if (kind === 'assignment') {
      this.assignmentError = message;
    } else if (kind === 'status') {
      this.statusError = message;
    } else {
      this.dueDateError = message;
    }
  }

  private clearErrors(): void {
    this.assignmentError = '';
    this.statusError = '';
    this.dueDateError = '';
  }

  private clearFeedback(): void {
    this.successMessage = '';
    this.conflictMessage = '';
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

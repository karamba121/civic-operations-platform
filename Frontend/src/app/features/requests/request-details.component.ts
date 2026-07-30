import { DatePipe, DecimalPipe, DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import {
  PagedRequestAudit,
  PagedRequestComments,
  RequestAttachment,
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
  private readonly document = inject(DOCUMENT);

  @ViewChild('attachmentInput')
  private attachmentInput?: ElementRef<HTMLInputElement>;

  request: RequestDetails | null = null;
  comments: PagedRequestComments | null = null;
  attachments: RequestAttachment[] | null = null;
  audit: PagedRequestAudit | null = null;
  loading = true;
  commentsLoading = true;
  attachmentsLoading = true;
  auditLoading = true;
  errorMessage = '';
  commentsError = '';
  attachmentsError = '';
  auditError = '';
  commentContent = '';
  commentError = '';
  commentSuccess = '';
  submittingComment = false;
  selectedAttachment: File | null = null;
  attachmentUploadError = '';
  attachmentSuccess = '';
  uploadingAttachment = false;
  downloadingAttachmentId: string | null = null;
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
    this.loadAttachments();
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

  onCommentInput(event: Event): void {
    this.commentContent = (event.target as HTMLTextAreaElement).value;
    this.commentError = '';
    this.commentSuccess = '';
  }

  addComment(event: Event): void {
    event.preventDefault();
    const content = this.commentContent.trim();

    if (!content) {
      this.commentError = 'Escreva um comentário antes de enviar.';
      return;
    }

    if (content.length > 2000) {
      this.commentError = 'O comentário deve ter no máximo 2.000 caracteres.';
      return;
    }

    const requestId = this.requestId;
    if (!requestId) {
      return;
    }

    this.submittingComment = true;
    this.commentError = '';
    this.commentSuccess = '';
    this.api
      .addComment(requestId, content)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.submittingComment = false)),
      )
      .subscribe({
        next: () => {
          this.commentContent = '';
          this.commentSuccess = 'Comentário adicionado com sucesso.';
          this.loadComments(1);
          this.loadAudit(1);
        },
        error: (error: unknown) => {
          this.commentError = this.errorText(
            error,
            'Não foi possível adicionar o comentário.',
          );
        },
      });
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

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedAttachment = input.files?.item(0) ?? null;
    this.attachmentUploadError = '';
    this.attachmentSuccess = '';

    if (
      this.selectedAttachment &&
      !this.validateAttachment(this.selectedAttachment)
    ) {
      this.selectedAttachment = null;
      input.value = '';
    }
  }

  uploadAttachment(event: Event): void {
    event.preventDefault();
    const requestId = this.requestId;
    const file = this.selectedAttachment;
    if (!requestId || !file) {
      this.attachmentUploadError =
        'Selecione um arquivo PDF, PNG ou JPEG para enviar.';
      return;
    }

    this.uploadingAttachment = true;
    this.attachmentUploadError = '';
    this.attachmentSuccess = '';
    this.api
      .uploadAttachment(requestId, file)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.uploadingAttachment = false)),
      )
      .subscribe({
        next: (attachment) => {
          this.attachments = [
            attachment,
            ...(this.attachments ?? []).filter(
              (current) => current.id !== attachment.id,
            ),
          ];
          this.selectedAttachment = null;
          if (this.attachmentInput) {
            this.attachmentInput.nativeElement.value = '';
          }
          this.attachmentSuccess = 'Anexo enviado com sucesso.';
          this.loadAudit(1);
        },
        error: (error: unknown) => {
          this.attachmentUploadError = this.attachmentErrorText(
            error,
            'Não foi possível enviar o anexo.',
          );
        },
      });
  }

  loadAttachments(): void {
    const requestId = this.requestId;
    if (!requestId) {
      return;
    }

    this.attachmentsLoading = true;
    this.attachmentsError = '';
    this.api
      .listAttachments(requestId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.attachmentsLoading = false)),
      )
      .subscribe({
        next: (attachments) => (this.attachments = attachments),
        error: (error: unknown) => {
          this.attachments = null;
          this.attachmentsError = this.attachmentErrorText(
            error,
            'Não foi possível carregar os anexos.',
          );
        },
      });
  }

  downloadAttachment(attachment: RequestAttachment): void {
    const requestId = this.requestId;
    if (!requestId || this.downloadingAttachmentId) {
      return;
    }

    this.downloadingAttachmentId = attachment.id;
    this.attachmentsError = '';
    this.api
      .downloadAttachment(requestId, attachment.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.downloadingAttachmentId = null)),
      )
      .subscribe({
        next: (content) => {
          const objectUrl = URL.createObjectURL(content);
          const link = this.document.createElement('a');
          link.href = objectUrl;
          link.download = attachment.fileName;
          link.style.display = 'none';
          this.document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(objectUrl);
          this.loadAudit(1);
        },
        error: (error: unknown) => {
          this.attachmentsError = this.attachmentErrorText(
            error,
            'Não foi possível baixar o anexo.',
          );
        },
      });
  }

  formatFileSize(sizeBytes: number): string {
    if (sizeBytes < 1024) {
      return `${sizeBytes} B`;
    }

    if (sizeBytes < 1024 * 1024) {
      return `${(sizeBytes / 1024).toFixed(1)} KB`;
    }

    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
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

  private validateAttachment(file: File): boolean {
    const maximumSizeBytes = 25 * 1024 * 1024;
    if (file.size > maximumSizeBytes) {
      this.attachmentUploadError = 'O arquivo deve ter no máximo 25 MB.';
      return false;
    }

    if (file.name.length > 255) {
      this.attachmentUploadError =
        'O nome do arquivo deve ter no máximo 255 caracteres.';
      return false;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    const acceptedTypes: Record<string, string[]> = {
      pdf: ['application/pdf'],
      png: ['image/png'],
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
    };

    if (!extension || !acceptedTypes[extension]?.includes(file.type)) {
      this.attachmentUploadError =
        'Formato não permitido. Selecione um arquivo PDF, PNG ou JPEG válido.';
      return false;
    }

    return true;
  }

  private attachmentErrorText(error: unknown, fallback: string): string {
    if (!(error instanceof CivicOpsApiError)) {
      return fallback;
    }

    switch (error.status) {
      case 403:
        return 'Você não tem permissão para acessar os anexos desta solicitação.';
      case 413:
        return 'O arquivo excede o limite de 25 MB.';
      case 415:
        return 'Formato não permitido. Envie apenas arquivos PDF, PNG ou JPEG válidos.';
      default:
        return error.message;
    }
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

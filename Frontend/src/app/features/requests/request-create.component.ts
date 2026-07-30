import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import { CreateRequestInput } from './data-access/request.model';
import { RequestsApi } from './data-access/requests.api';

type CreateRequestErrors = Partial<Record<keyof CreateRequestInput, string>>;

@Component({
  selector: 'app-request-create',
  imports: [RouterLink],
  templateUrl: './request-create.component.html',
})
export class RequestCreateComponent {
  private readonly api = inject(RequestsApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  title = '';
  description = '';
  errors: CreateRequestErrors = {};
  errorMessage = '';
  submitting = false;

  private idempotencyKey = crypto.randomUUID();
  private submittedFingerprint = '';

  onTitleInput(event: Event): void {
    this.title = (event.target as HTMLInputElement).value;
    delete this.errors.title;
  }

  onDescriptionInput(event: Event): void {
    this.description = (event.target as HTMLTextAreaElement).value;
    delete this.errors.description;
  }

  submit(event: Event): void {
    event.preventDefault();
    const input: CreateRequestInput = {
      title: this.title.trim(),
      description: this.description.trim(),
    };

    if (!this.validate(input)) {
      return;
    }

    const fingerprint = JSON.stringify(input);
    if (this.submittedFingerprint && this.submittedFingerprint !== fingerprint) {
      this.idempotencyKey = crypto.randomUUID();
    }
    this.submittedFingerprint = fingerprint;
    this.submitting = true;
    this.errorMessage = '';

    this.api
      .create(input, this.idempotencyKey)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.submitting = false)),
      )
      .subscribe({
        next: (created) => {
          void this.router.navigate(['/solicitacoes', created.id], {
            queryParams: { criada: '1' },
          });
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof CivicOpsApiError
              ? error.message
              : 'Não foi possível registrar a solicitação. Tente novamente.';
        },
      });
  }

  private validate(input: CreateRequestInput): boolean {
    const errors: CreateRequestErrors = {};

    if (!input.title) {
      errors.title = 'Informe o título da solicitação.';
    } else if (input.title.length > 200) {
      errors.title = 'O título deve ter no máximo 200 caracteres.';
    }

    if (!input.description) {
      errors.description = 'Descreva a necessidade ou ocorrência.';
    } else if (input.description.length > 4000) {
      errors.description = 'A descrição deve ter no máximo 4.000 caracteres.';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }
}

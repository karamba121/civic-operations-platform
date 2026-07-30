import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import { PlatformApi } from '../platform/data-access/platform.api';
import {
  CreateTenantUserPayload,
  ManagedUserSummary,
} from '../platform/data-access/platform.model';

@Component({
  selector: 'app-tenant-users-admin',
  imports: [FormsModule],
  templateUrl: './tenant-users-admin.component.html',
})
export class TenantUsersAdminComponent implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly destroyRef = inject(DestroyRef);

  users: ManagedUserSummary[] = [];
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  form: CreateTenantUserPayload = this.emptyForm();

  ngOnInit(): void {
    this.load();
  }

  createUser(): void {
    if (this.saving) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;
    this.api
      .createTenantUser(this.form)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.saving = false)),
      )
      .subscribe({
        next: (user) => {
          this.users = [...this.users, user].sort((left, right) =>
            left.displayName.localeCompare(right.displayName),
          );
          this.form = this.emptyForm();
          this.successMessage = `Usuário ${user.username} criado.`;
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof CivicOpsApiError
              ? error.message
              : 'Não foi possível criar o usuário.';
        },
      });
  }

  private load(): void {
    this.loading = true;
    this.api
      .listTenantUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (users) => (this.users = users),
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof CivicOpsApiError
              ? error.message
              : 'Não foi possível carregar os usuários.';
        },
      });
  }

  private emptyForm(): CreateTenantUserPayload {
    return {
      username: '',
      displayName: '',
      email: '',
      password: '',
      role: 'Reader',
    };
  }
}

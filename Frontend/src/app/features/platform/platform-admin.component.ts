import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import { PlatformApi } from './data-access/platform.api';
import {
  CreatePlatformAdministratorPayload,
  CreateTenantPayload,
  ManagedUserSummary,
  TenantSummary,
} from './data-access/platform.model';

@Component({
  selector: 'app-platform-admin',
  imports: [DatePipe, FormsModule],
  templateUrl: './platform-admin.component.html',
})
export class PlatformAdminComponent implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);

  tenants: TenantSummary[] = [];
  administrators: ManagedUserSummary[] = [];
  loading = true;
  savingTenant = false;
  savingAdministrator = false;
  errorMessage = '';
  successMessage = '';

  tenantForm: CreateTenantPayload = this.emptyTenant();
  administratorForm: CreatePlatformAdministratorPayload =
    this.emptyAdministrator();

  ngOnInit(): void {
    this.load();
  }

  createTenant(): void {
    if (this.savingTenant) {
      return;
    }

    this.clearFeedback();
    this.savingTenant = true;
    this.api
      .createTenant(this.tenantForm)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.savingTenant = false)),
      )
      .subscribe({
        next: (tenant) => {
          this.tenants = [...this.tenants, tenant].sort((left, right) =>
            left.name.localeCompare(right.name),
          );
          this.tenantForm = this.emptyTenant();
          this.successMessage =
            `Tenant ${tenant.name} e seu administrador foram criados.`;
        },
        error: (error: unknown) => {
          this.errorMessage = this.errorText(
            error,
            'Não foi possível criar o tenant.',
          );
        },
      });
  }

  createAdministrator(): void {
    if (this.savingAdministrator) {
      return;
    }

    this.clearFeedback();
    this.savingAdministrator = true;
    this.api
      .createPlatformAdministrator(this.administratorForm)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.savingAdministrator = false)),
      )
      .subscribe({
        next: (administrator) => {
          this.administrators = [
            ...this.administrators,
            administrator,
          ].sort((left, right) =>
            left.username.localeCompare(right.username),
          );
          this.administratorForm = this.emptyAdministrator();
          this.successMessage =
            `Administrador ${administrator.username} criado.`;
        },
        error: (error: unknown) => {
          this.errorMessage = this.errorText(
            error,
            'Não foi possível criar o administrador.',
          );
        },
      });
  }

  logout(): void {
    void this.auth.logout();
  }

  private load(): void {
    this.loading = true;
    forkJoin({
      tenants: this.api.listTenants(),
      administrators: this.api.listPlatformAdministrators(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: ({ tenants, administrators }) => {
          this.tenants = tenants;
          this.administrators = administrators;
        },
        error: (error: unknown) => {
          this.errorMessage = this.errorText(
            error,
            'Não foi possível carregar a administração da plataforma.',
          );
        },
      });
  }

  private clearFeedback(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private errorText(error: unknown, fallback: string): string {
    return error instanceof CivicOpsApiError
      ? error.message
      : fallback;
  }

  private emptyTenant(): CreateTenantPayload {
    return {
      name: '',
      slug: '',
      administratorUsername: '',
      administratorDisplayName: '',
      administratorEmail: '',
      administratorPassword: '',
    };
  }

  private emptyAdministrator():
    CreatePlatformAdministratorPayload {
    return {
      username: '',
      displayName: '',
      email: '',
      password: '',
    };
  }
}

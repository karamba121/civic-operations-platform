import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ActorContextService } from '../../core/context/actor-context.service';
import { CivicOpsApiError } from '../../core/http/civic-ops-api-error';
import {
  TenantMembership,
  TenantRole,
} from './data-access/access.model';
import { AccessApi } from './data-access/access.api';

const TENANT_ROLES: TenantRole[] = [
  'Administrator',
  'Operator',
  'Reader',
];

@Component({
  selector: 'app-members-admin',
  imports: [DatePipe],
  templateUrl: './members-admin.component.html',
})
export class MembersAdminComponent implements OnInit {
  private readonly api = inject(AccessApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly actorContext = inject(ActorContextService);

  members: TenantMembership[] | null = null;
  roleSelections: Record<string, TenantRole> = {};
  loading = true;
  errorMessage = '';
  newUserId = '';
  newRole: TenantRole = 'Reader';
  formError = '';
  successMessage = '';
  savingUserId: string | null = null;

  readonly roles = TENANT_ROLES;
  readonly roleLabels: Record<TenantRole, string> = {
    Administrator: 'Administrador',
    Operator: 'Operador',
    Reader: 'Leitor',
  };
  readonly permissionLabels: Record<string, string> = {
    'access.manage': 'Gerenciar acessos',
    'attachments.read': 'Consultar anexos',
    'attachments.write': 'Enviar anexos',
  };

  ngOnInit(): void {
    this.load();
  }

  retry(): void {
    this.load();
  }

  onNewUserInput(event: Event): void {
    this.newUserId = (event.target as HTMLInputElement).value.trim();
    this.clearFeedback();
  }

  onNewRoleChange(event: Event): void {
    this.newRole = (event.target as HTMLSelectElement).value as TenantRole;
    this.clearFeedback();
  }

  onMemberRoleChange(userId: string, event: Event): void {
    this.roleSelections[userId] = (event.target as HTMLSelectElement)
      .value as TenantRole;
    this.clearFeedback();
  }

  submitMember(event: Event): void {
    event.preventDefault();
    if (!this.isValidUuid(this.newUserId)) {
      this.formError = 'Informe um identificador de usuário válido.';
      return;
    }

    this.saveRole(this.newUserId, this.newRole, true);
  }

  saveMember(member: TenantMembership): void {
    const role = this.roleSelections[member.userId];
    if (!role || role === member.role) {
      return;
    }

    this.saveRole(member.userId, role, false);
  }

  isCurrentUser(userId: string): boolean {
    return userId === this.actorContext.userId;
  }

  shortUser(userId: string): string {
    return `Usuário ${userId.slice(0, 8)}`;
  }

  permissionLabel(permission: string): string {
    return this.permissionLabels[permission] ?? permission;
  }

  private load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api
      .listMembers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (members) => {
          this.members = this.sortMembers(members);
          this.synchronizeSelections();
        },
        error: (error: unknown) => {
          this.members = null;
          this.errorMessage = this.accessErrorText(
            error,
            'Não foi possível carregar os membros.',
          );
        },
      });
  }

  private saveRole(
    userId: string,
    role: TenantRole,
    clearForm: boolean,
  ): void {
    if (this.savingUserId) {
      return;
    }

    this.savingUserId = userId;
    this.clearFeedback();
    this.api
      .setMemberRole(userId, role)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.savingUserId = null)),
      )
      .subscribe({
        next: (updated) => {
          const current = this.members ?? [];
          this.members = this.sortMembers([
            updated,
            ...current.filter((member) => member.userId !== updated.userId),
          ]);
          this.synchronizeSelections();
          if (clearForm) {
            this.newUserId = '';
            this.newRole = 'Reader';
          }
          this.successMessage = `${this.shortUser(updated.userId)} agora possui o papel ${this.roleLabels[updated.role].toLowerCase()}.`;
        },
        error: (error: unknown) => {
          this.formError = this.accessErrorText(
            error,
            'Não foi possível alterar o papel do membro.',
          );
          this.synchronizeSelections();
        },
      });
  }

  private synchronizeSelections(): void {
    this.roleSelections = Object.fromEntries(
      (this.members ?? []).map((member) => [member.userId, member.role]),
    );
  }

  private sortMembers(members: TenantMembership[]): TenantMembership[] {
    const roleOrder: Record<TenantRole, number> = {
      Administrator: 0,
      Operator: 1,
      Reader: 2,
    };
    return [...members].sort(
      (left, right) =>
        roleOrder[left.role] - roleOrder[right.role] ||
        left.userId.localeCompare(right.userId),
    );
  }

  private accessErrorText(error: unknown, fallback: string): string {
    if (!(error instanceof CivicOpsApiError)) {
      return fallback;
    }

    return error.status === 403
      ? 'Você não possui permissão para administrar os membros deste tenant.'
      : error.message;
  }

  private isValidUuid(value: string): boolean {
    return (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value,
      ) && value !== '00000000-0000-0000-0000-000000000000'
    );
  }

  private clearFeedback(): void {
    this.formError = '';
    this.successMessage = '';
  }
}

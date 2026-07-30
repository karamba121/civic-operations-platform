import { Routes } from '@angular/router';
import {
  platformAdministratorGuard,
  tenantWorkspaceGuard,
} from './core/auth/authorization.guards';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: 'platform',
    canMatch: [platformAdministratorGuard],
    loadComponent: () =>
      import('./features/platform/platform-admin.component').then(
        (module) => module.PlatformAdminComponent,
      ),
    title: 'Administração da plataforma | CivicOps',
  },
  {
    path: 'identidade-invalida',
    loadComponent: () =>
      import('./features/auth/invalid-identity.component').then(
        (module) => module.InvalidIdentityComponent,
      ),
    title: 'Identidade sem acesso | CivicOps',
  },
  {
    path: '',
    canMatch: [tenantWorkspaceGuard],
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (module) => module.DashboardComponent,
          ),
        title: 'Visão geral | CivicOps',
      },
      {
        path: 'solicitacoes',
        loadComponent: () =>
          import('./features/requests/requests-list.component').then(
            (module) => module.RequestsListComponent,
          ),
        title: 'Solicitações | CivicOps',
      },
      {
        path: 'solicitacoes/nova',
        loadComponent: () =>
          import('./features/requests/request-create.component').then(
            (module) => module.RequestCreateComponent,
          ),
        title: 'Nova solicitação | CivicOps',
      },
      {
        path: 'solicitacoes/:id',
        loadComponent: () =>
          import('./features/requests/request-details.component').then(
            (module) => module.RequestDetailsComponent,
          ),
        title: 'Detalhe da solicitação | CivicOps',
      },
      {
        path: 'notificacoes',
        loadComponent: () =>
          import(
            './features/notifications/notifications-center.component'
          ).then((module) => module.NotificationsCenterComponent),
        title: 'Notificações | CivicOps',
      },
      {
        path: 'administracao/membros',
        loadComponent: () =>
          import(
            './features/access/tenant-users-admin.component'
          ).then((module) => module.TenantUsersAdminComponent),
        title: 'Usuários e permissões | CivicOps',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
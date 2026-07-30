import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
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
          import('./features/access/members-admin.component').then(
            (module) => module.MembersAdminComponent,
          ),
        title: 'Membros e permissões | CivicOps',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

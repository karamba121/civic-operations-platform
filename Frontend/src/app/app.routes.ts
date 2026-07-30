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
        path: 'solicitacoes/:id',
        loadComponent: () =>
          import('./features/requests/request-details.component').then(
            (module) => module.RequestDetailsComponent,
          ),
        title: 'Detalhe da solicitação | CivicOps',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

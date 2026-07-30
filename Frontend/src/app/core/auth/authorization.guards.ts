import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const platformAdministratorGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isPlatformAdministrator
    ? true
    : router.parseUrl('/');
};

export const tenantWorkspaceGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isPlatformAdministrator) {
    return router.parseUrl('/platform');
  }

  return auth.tenantId
    ? true
    : router.parseUrl('/identidade-invalida');
};

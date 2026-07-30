import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ActorContextService } from '../context/actor-context.service';

export const civicOpsContextInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }

  const context = inject(ActorContextService);
  return next(
    request.clone({
      setHeaders: {
        'X-Tenant-Id': context.tenantId,
        'X-User-Id': context.userId,
      },
    }),
  );
};

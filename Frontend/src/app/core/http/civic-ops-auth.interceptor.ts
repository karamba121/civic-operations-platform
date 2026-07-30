import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const civicOpsAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) {
    return next(request);
  }

  const auth = inject(AuthService);
  const currentToken = auth.accessToken;
  if (currentToken) {
    void auth.ensureValidToken();
    return next(
      request.clone({
        setHeaders: { Authorization: `Bearer ${currentToken}` },
      }),
    );
  }

  return from(auth.ensureValidToken()).pipe(
    switchMap((token) =>
      next(
        token
          ? request.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            })
          : request,
      ),
    ),
  );
};

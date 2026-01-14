import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../auth/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(TokenStorageService);
  const token = storage.getAccessToken();

  if (!token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};

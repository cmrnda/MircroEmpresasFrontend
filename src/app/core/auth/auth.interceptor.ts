import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {AuthStateService} from './auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthStateService);

  let r = req;

  const token = state.token();
  if (token) {
    r = r.clone({setHeaders: {Authorization: `Bearer ${token}`}});
  }

  const empresaId = state.empresaId();
  if (empresaId !== null && empresaId !== undefined) {
    if (!r.headers.has('X-Empresa-Id')) {
      r = r.clone({setHeaders: {'X-Empresa-Id': String(empresaId)}});
    }
  }

  return next(r);
};

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthStateService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (err?.status === 401) {
        state.clear();
        router.navigateByUrl('/login/platform');
      }
      return throwError(() => err);
    })
  );
};

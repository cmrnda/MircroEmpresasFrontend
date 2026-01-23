import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {AuthStateService} from './auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthStateService);

  let r = req;

  const url = String(r.url || '');
  const isShop = url.includes('/shop/');
  const isShopProtected = isShop && (url.includes('/orders') || url.includes('/my/orders') || url.includes('/notifications'));


  const token = state.token();
  if (token && (!isShop || isShopProtected)) {
    r = r.clone({setHeaders: {Authorization: `Bearer ${token}`}});
  }

  const empresaId = state.empresaId();
  if (!isShop && empresaId !== null && !r.headers.has('X-Empresa-Id')) {
    r = r.clone({setHeaders: {'X-Empresa-Id': String(empresaId)}});
  }

  return next(r);
};

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const state = inject(AuthStateService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      if (err?.status === 401) {
        const t = state.type() ?? 'platform';
        state.clear();
        router.navigateByUrl(`/login/${t}`);
      }
      return throwError(() => err);
    })
  );
};

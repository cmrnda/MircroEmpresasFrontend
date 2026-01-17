import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const subscriptionRequiredInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      const status = e?.status;
      const body: any = e?.error;

      if (status === 402 && body?.error === 'subscription_required') {
        router.navigateByUrl('/tenant/subscription');
      }

      return throwError(() => e);
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from './auth-state.service';

export const authGuard: CanActivateFn = () => {
  const state = inject(AuthStateService);
  const router = inject(Router);

  if (state.isAuthenticated()) return true;
  router.navigateByUrl('/login/platform');
  return false;
};

export const typeGuard = (t: 'platform' | 'user' | 'client') => {
  const guard: CanActivateFn = () => {
    const state = inject(AuthStateService);
    const router = inject(Router);

    if (!state.isAuthenticated()) {
      router.navigateByUrl('/login/platform');
      return false;
    }

    const type = state.claims()?.type;
    if (type === t) return true;

    if (type === 'platform') router.navigateByUrl('/platform');
    else if (type === 'user') router.navigateByUrl('/tenant');
    else router.navigateByUrl('/client');

    return false;
  };

  return guard;
};

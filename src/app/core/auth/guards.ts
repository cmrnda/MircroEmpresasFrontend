import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from './auth-state.service';

export const authGuard: CanActivateFn = () => {
  const state = inject(AuthStateService);
  const router = inject(Router);
  if (state.isAuthenticated()) return true;
  router.navigateByUrl('/login/platform');
  return false;
};

export function typeGuard(type: 'platform' | 'user' | 'client'): CanActivateFn {
  return () => {
    const state = inject(AuthStateService);
    const router = inject(Router);
    if (!state.isAuthenticated()) {
      router.navigateByUrl('/login/platform');
      return false;
    }
    if (state.claims()?.type === type) return true;
    router.navigateByUrl('/forbidden');
    return false;
  };
}

export function roleGuard(anyOf: string[]): CanActivateFn {
  return () => {
    const state = inject(AuthStateService);
    const router = inject(Router);
    const roles = state.roles();
    const ok = anyOf.some(r => roles.includes(r));
    if (ok) return true;
    router.navigateByUrl('/forbidden');
    return false;
  };
}

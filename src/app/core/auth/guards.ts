import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService, AuthType } from './auth-state.service';

function inferModeFromUrl(url: string): AuthType {
  const u = String(url || '');
  if (u.startsWith('/tenant')) return 'user';
  if (u.startsWith('/client')) return 'client';
  if (u.startsWith('/platform')) return 'platform';
  return 'platform';
}

export const authGuard: CanActivateFn = (_, st) => {
  const state = inject(AuthStateService);
  const router = inject(Router);

  if (state.isAuthenticated()) return true;

  const mode = inferModeFromUrl(st.url);
  router.navigateByUrl(`/login/${mode}`);
  return false;
};

export const typeGuard = (t: AuthType) => {
  const guard: CanActivateFn = () => {
    const state = inject(AuthStateService);
    const router = inject(Router);

    if (!state.isAuthenticated()) {
      router.navigateByUrl(`/login/${t}`);
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

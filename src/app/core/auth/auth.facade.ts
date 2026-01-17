import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, tap } from 'rxjs';
import { AuthApi } from './auth.api';
import { AuthClaims, AuthStateService, AuthType } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly _api = inject(AuthApi);
  private readonly _state = inject(AuthStateService);
  private readonly _router = inject(Router);

  public login(mode: AuthType, payload: any) {
    if (mode === 'platform') {
      return this._api.loginPlatform(payload).pipe(
        tap((res) => {
          const claims: AuthClaims = {
            type: 'platform',
            usuario_id: res.usuario?.usuario_id ?? null,
            roles: ['PLATFORM_ADMIN']
          };
          this._state.applyLogin(res.access_token, claims);
        }),
        map(() => true),
        catchError(() => of(false))
      );
    }

    if (mode === 'user') {
      return this._api.loginTenant(payload).pipe(
        tap((res) => {
          const claims: AuthClaims = {
            type: 'user',
            usuario_id: res.usuario?.usuario_id ?? null,
            empresa_id: res.empresa_id ?? null,
            roles: res.roles ?? []
          };
          this._state.applyLogin(res.access_token, claims);
        }),
        map(() => true),
        catchError(() => of(false))
      );
    }

    return this._api.loginClient(payload).pipe(
      tap((res) => {
        const claims: AuthClaims = {
          type: 'client',
          cliente_id: res.cliente?.cliente_id ?? null,
          empresa_id: res.empresa_id ?? null
        };
        this._state.applyLogin(res.access_token, claims);
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  public logout() {
    return this._api.logout().pipe(
      catchError(() => of({ ok: true })),
      tap(() => this._state.clear()),
      tap(() => this._router.navigateByUrl('/login/platform'))
    );
  }
}

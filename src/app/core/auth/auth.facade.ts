import { Injectable, signal } from '@angular/core';
import { AuthApi, LoginResponse } from './auth.api';
import { TokenStorageService } from './token-storage.service';
import { AuthStateService } from './auth-state.service';
import { catchError, finalize, of, tap } from 'rxjs';

type LoginMode = 'platform' | 'tenant' | 'client';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly tenantsNeeded = signal<Array<{ empresa_id: number; nombre: string }> | null>(null);

  public constructor(
    private readonly _api: AuthApi,
    private readonly _storage: TokenStorageService,
    private readonly _state: AuthStateService
  ) {}

  private setSession(res: LoginResponse): void {
    this._storage.setTokens(res.access_token, res.refresh_token);
    this._state.setAccessToken(res.access_token);
  }

  public login(mode: LoginMode, email: string, password: string, empresaId?: number) {
    this.loading.set(true);
    this.error.set(null);
    this.tenantsNeeded.set(null);

    const call =
      mode === 'platform'
        ? this._api.loginPlatform(email, password)
        : mode === 'tenant'
        ? this._api.loginTenant(email, password, empresaId)
        : this._api.loginClient(email, password, empresaId);

    return call.pipe(
      tap(res => this.setSession(res)),
      catchError((e: any) => {
        const status = e?.status;
        const body = e?.error;
        if (status === 409 && body?.error === 'empresa_required') {
          const tenants = body?.data?.tenants ?? [];
          this.tenantsNeeded.set(tenants);
          this.error.set('empresa_required');
          return of(null);
        }
        this.error.set(body?.error ?? 'login_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public logout() {
    this.loading.set(true);
    this.error.set(null);

    return this._api.logout().pipe(
      tap(() => this._state.clear()),
      catchError(() => {
        this._state.clear();
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

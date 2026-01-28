import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ClientAuthApi, ClientLoginRequest, ClientRegisterRequest } from './client-auth.api';
import { ClientTokenStorageService } from './client-token-storage.service';
import { decodeJwt, isExpired, JwtClaims } from './jwt';

@Injectable({ providedIn: 'root' })
export class ClientAuthService {
  private readonly _api = inject(ClientAuthApi);
  private readonly _storage = inject(ClientTokenStorageService);

  private readonly _accessToken = signal<string | null>(cleanStr(this._storage.getAccessToken()));
  private readonly _refreshToken = signal<string | null>(cleanStr(this._storage.getRefreshToken()));

  public readonly accessToken = computed(() => this._accessToken());
  public readonly claims = computed<JwtClaims | null>(() => {
    const t = this._accessToken();
    if (!t) return null;
    return decodeJwt(t);
  });

  public readonly loggedIn = computed(() => {
    const c = this.claims();
    if (!c) return false;
    if (c.type !== 'client') return false;
    if (isExpired(c)) return false;
    return true;
  });

  public constructor() {
    effect(() => {
      if (this._accessToken() && !this.loggedIn()) {
        this.logout();
      }
    });
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    const a = cleanStr(accessToken);
    const r = cleanStr(refreshToken);

    this._accessToken.set(a);
    this._refreshToken.set(r);

    if (a && r) this._storage.setTokens(a, r);
    else this._storage.clear();
  }

  public logout(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._storage.clear();
  }

  public login(empresa_id: number, payload: { email: string; password: string }) {
    const req: ClientLoginRequest = {
      empresa_id: Number(empresa_id),
      email: String(payload.email || ''),
      password: String(payload.password || '')
    };
    return this._api.login(req);
  }

  public register(empresa_id: number, payload: { email: string; password: string; nombre_razon: string; nit_ci?: any; telefono?: any }) {
    const req: ClientRegisterRequest = {
      empresa_id: Number(empresa_id),
      email: String(payload.email || ''),
      password: String(payload.password || ''),
      nombre_razon: String(payload.nombre_razon || ''),
      nit_ci: cleanStr(payload.nit_ci),
      telefono: cleanStr(payload.telefono)
    };
    return this._api.register(req);
  }
}

function cleanStr(v: any): string | null {
  const s = String(v ?? '').trim();
  return s ? s : null;
}

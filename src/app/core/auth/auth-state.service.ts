import { computed, Injectable, signal } from '@angular/core';

export type AuthType = 'platform' | 'user' | 'client';

export type AuthClaims = {
  type: AuthType;
  empresa_id?: number | null;
  usuario_id?: number | null;
  cliente_id?: number | null;
  roles?: string[];
};

type StoredSession = {
  access_token: string;
  refresh_token: string | null;
  claims: AuthClaims;
};

const KEY_V2 = 'sp_auth_session_v2';
const KEY_V1 = 'sp_auth_session_v1';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  public readonly token = signal<string | null>(null);
  public readonly refreshToken = signal<string | null>(null);

  public readonly empresaId = signal<number | null>(null);
  public readonly usuarioId = signal<number | null>(null);
  public readonly clienteId = signal<number | null>(null);

  private readonly _claims = signal<AuthClaims | null>(null);
  public readonly claims = this._claims.asReadonly();

  public readonly type = computed(() => this._claims()?.type ?? null);

  public readonly isAuthenticated = computed(() => !!this.token() && !!this._claims());

  public readonly isPlatform = computed(() => this._claims()?.type === 'platform');
  public readonly isTenantUser = computed(() => this._claims()?.type === 'user');
  public readonly isClient = computed(() => this._claims()?.type === 'client');

  private _storage(): Storage | null {
    try {
      return sessionStorage;
    } catch {
      return null;
    }
  }

  public constructor() {
    try {
      localStorage.removeItem(KEY_V1);
    } catch {}

    const st = this._storage();
    if (!st) return;

    const raw = st.getItem(KEY_V2);
    if (!raw) return;

    try {
      const s = JSON.parse(raw) as StoredSession;
      this.applyLogin(s.access_token, s.claims, s.refresh_token ?? null);
    } catch {
      st.removeItem(KEY_V2);
    }
  }

  public applyLogin(accessToken: string, claims: AuthClaims, refreshToken: string | null = null): void {
    this.token.set(accessToken);
    this.refreshToken.set(refreshToken);
    this._claims.set(claims);

    this.empresaId.set(claims.empresa_id ?? null);
    this.usuarioId.set(claims.usuario_id ?? null);
    this.clienteId.set(claims.cliente_id ?? null);

    const st = this._storage();
    if (!st) return;

    st.setItem(KEY_V2, JSON.stringify({ access_token: accessToken, refresh_token: refreshToken, claims }));
  }

  public clear(): void {
    this.token.set(null);
    this.refreshToken.set(null);

    this._claims.set(null);
    this.empresaId.set(null);
    this.usuarioId.set(null);
    this.clienteId.set(null);

    const st = this._storage();
    if (!st) return;

    st.removeItem(KEY_V2);
  }
}

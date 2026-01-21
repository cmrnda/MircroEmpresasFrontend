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
  claims: AuthClaims;
};

const KEY = 'sp_auth_session_v1';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  public readonly token = signal<string | null>(null);

  public readonly empresaId = signal<number | null>(null);
  public readonly usuarioId = signal<number | null>(null);
  public readonly clienteId = signal<number | null>(null);

  private readonly _claims = signal<AuthClaims | null>(null);
  public readonly claims = this._claims.asReadonly();

  public readonly type = computed(() => this._claims()?.type ?? null);

  public readonly isAuthenticated = computed(
    () => !!this.token() && !!this._claims()
  );

  public readonly isPlatform = computed(
    () => this._claims()?.type === 'platform'
  );

  public readonly isTenantUser = computed(
    () => this._claims()?.type === 'user'
  );

  public readonly isClient = computed(
    () => this._claims()?.type === 'client'
  );

  public constructor() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;

    try {
      const s = JSON.parse(raw) as StoredSession;
      this.applyLogin(s.access_token, s.claims);
    } catch {
      localStorage.removeItem(KEY);
    }
  }

  public applyLogin(accessToken: string, claims: AuthClaims): void {
    this.token.set(accessToken);
    this._claims.set(claims);

    this.empresaId.set(claims.empresa_id ?? null);
    this.usuarioId.set(claims.usuario_id ?? null);
    this.clienteId.set(claims.cliente_id ?? null);

    localStorage.setItem(
      KEY,
      JSON.stringify({ access_token: accessToken, claims })
    );
  }

  public clear(): void {
    this.token.set(null);
    this._claims.set(null);
    this.empresaId.set(null);
    this.usuarioId.set(null);
    this.clienteId.set(null);
    localStorage.removeItem(KEY);
  }
}

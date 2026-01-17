import { computed, Injectable, signal } from '@angular/core';
import { TokenStorageService } from './token-storage.service';
import { decodeJwt, isExpired, JwtClaims } from './jwt-utils';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly _claims = signal<JwtClaims | null>(null);

  public readonly claims = this._claims.asReadonly();

  public readonly isAuthenticated = computed(() => {
    const c = this._claims();
    return !!c && !isExpired(c);
  });

  public readonly type = computed(() => this._claims()?.type ?? null);
  public readonly empresaId = computed(() => this._claims()?.empresa_id ?? null);
  public readonly roles = computed(() => this._claims()?.roles ?? []);
  public readonly usuarioId = computed(() => this._claims()?.usuario_id ?? null);

  public readonly isPlatform = computed(() => this._claims()?.type === 'platform');
  public readonly isTenantUser = computed(() => this._claims()?.type === 'user');
  public readonly isClient = computed(() => this._claims()?.type === 'client');

  public constructor(private readonly _storage: TokenStorageService) {
    const token = this._storage.getAccessToken();
    if (token) this._claims.set(decodeJwt(token));
  }

  public setAccessToken(accessToken: string): void {
    this._claims.set(decodeJwt(accessToken));
  }

  public clear(): void {
    this._claims.set(null);
    this._storage.clear();
  }
}

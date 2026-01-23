import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly _accessKey = 'access_token';
  private readonly _refreshKey = 'refresh_token';

  private _storage(): Storage | null {
    try {
      return sessionStorage;
    } catch {
      return null;
    }
  }

  public getAccessToken(): string | null {
    const st = this._storage();
    return st ? st.getItem(this._accessKey) : null;
  }

  public getRefreshToken(): string | null {
    const st = this._storage();
    return st ? st.getItem(this._refreshKey) : null;
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    const st = this._storage();
    if (!st) return;
    st.setItem(this._accessKey, accessToken);
    st.setItem(this._refreshKey, refreshToken);
  }

  public clear(): void {
    const st = this._storage();
    if (!st) return;
    st.removeItem(this._accessKey);
    st.removeItem(this._refreshKey);
  }
}

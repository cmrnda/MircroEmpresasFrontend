import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class TokenStorageService {
  private readonly _accessKey = 'access_token';
  private readonly _refreshKey = 'refresh_token';

  public getAccessToken(): string | null {
    return localStorage.getItem(this._accessKey);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(this._refreshKey);
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this._accessKey, accessToken);
    localStorage.setItem(this._refreshKey, refreshToken);
  }

  public clear(): void {
    localStorage.removeItem(this._accessKey);
    localStorage.removeItem(this._refreshKey);
  }
}

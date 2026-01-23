import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const BASE = 'http://127.0.0.1:5000';

export type PlatformLoginResponse = {
  access_token: string;
  refresh_token: string;
  usuario: {
    usuario_id: number;
    email: string;
  };
};

export type TenantLoginResponse = {
  access_token: string;
  refresh_token: string;
  usuario: {
    usuario_id: number;
    email: string;
  };
  roles: string[];
  empresa_id: number;
};

export type ClientLoginResponse = {
  access_token: string;
  refresh_token: string;
  cliente: {
    cliente_id: number;
    email: string;
  };
  empresa_id: number;
};

@Injectable({ providedIn: 'root' })
export class AuthApi {
  public constructor(private readonly _http: HttpClient) {}

  public loginPlatform(payload: { email: string; password: string }): Observable<PlatformLoginResponse> {
    return this._http.post<PlatformLoginResponse>(`${BASE}/auth/platform/login`, payload);
  }

  public loginTenant(payload: { email: string; password: string; empresa_id: number }): Observable<TenantLoginResponse> {
    return this._http.post<TenantLoginResponse>(`${BASE}/auth/tenant/login`, payload);
  }

  public loginClient(payload: { email: string; password: string; empresa_id: number }): Observable<ClientLoginResponse> {
    return this._http.post<ClientLoginResponse>(`${BASE}/auth/client/login`, payload);
  }

  public logout(): Observable<{ ok: boolean }> {
    return this._http.post<{ ok: boolean }>(`${BASE}/auth/logout`, {});
  }

  public changeMyPassword(payload: { new_password: string }): Observable<{ ok: boolean }> {
    return this._http.put<{ ok: boolean }>(`${BASE}/auth/me/password`, payload);
  }
}

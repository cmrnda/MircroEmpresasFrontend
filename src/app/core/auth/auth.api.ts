import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {ApiClientService} from '../http/api-client.service'; // Importar ApiClientService

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
  public constructor(private readonly _api: ApiClientService) {}

  public loginPlatform(payload: { email: string; password: string }): Observable<PlatformLoginResponse> {
    return this._api.post<PlatformLoginResponse>('/auth/platform/login', payload);
  }

  public loginTenant(payload: { email: string; password: string; empresa_id: number }): Observable<TenantLoginResponse> {
    return this._api.post<TenantLoginResponse>('/auth/tenant/login', payload);
  }

  public loginClient(payload: { email: string; password: string; empresa_id: number }): Observable<ClientLoginResponse> {
    return this._api.post<ClientLoginResponse>('/auth/client/login', payload);
  }

  public logout(): Observable<{ ok: boolean }> {
    return this._api.post<{ ok: boolean }>('/auth/logout', {});
  }

  public changeMyPassword(payload: { new_password: string }): Observable<{ ok: boolean }> {
    return this._api.put<{ ok: boolean }>('/auth/me/password', payload);
  }
}

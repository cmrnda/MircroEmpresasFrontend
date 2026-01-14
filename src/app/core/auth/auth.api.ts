import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../http/api-client.service';

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  empresa_id?: number;
  roles?: string[];
  usuario?: any;
  cliente?: any;
};

export type TenantRequiredResponse = {
  error: 'empresa_required';
  data: { tenants: Array<{ empresa_id: number; nombre: string }> };
};

@Injectable({ providedIn: 'root' })
export class AuthApi {
  public constructor(private readonly _api: ApiClientService) {}

  public loginPlatform(email: string, password: string): Observable<LoginResponse> {
    return this._api.post<LoginResponse>('/auth/platform/login', { email, password });
  }

  public loginTenant(email: string, password: string, empresaId?: number): Observable<LoginResponse> {
    const headers = empresaId ? { 'X-Empresa-Id': String(empresaId) } : undefined;
    return this._api.post<LoginResponse>('/auth/tenant/login', { email, password }, headers);
  }

  public loginClient(email: string, password: string, empresaId?: number): Observable<LoginResponse> {
    const headers = empresaId ? { 'X-Empresa-Id': String(empresaId) } : undefined;
    return this._api.post<LoginResponse>('/auth/client/login', { email, password }, headers);
  }

  public logout(): Observable<{ ok: boolean }> {
    return this._api.post<{ ok: boolean }>('/auth/logout', {});
  }

  public changeMyPassword(newPassword: string): Observable<{ ok: boolean }> {
    return this._api.put<{ ok: boolean }>('/auth/me/password', { new_password: newPassword });
  }
}

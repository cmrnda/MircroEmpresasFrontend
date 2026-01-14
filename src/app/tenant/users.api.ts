import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiClientService} from '../core/http/api-client.service';

export type TenantUser = {
  usuario_id: number;
  email: string;
  activo: boolean;
  tenant_activo: boolean;
  empresa_id: number;
  roles: string[];
};

@Injectable({providedIn: 'root'})
export class UsersApi {
  public constructor(private readonly _api: ApiClientService) {
  }

  public list(): Observable<TenantUser[]> {
    return this._api.get<TenantUser[]>('/tenant/users');
  }

  public create(payload: { email: string; password: string; roles: string[] }): Observable<any> {
    return this._api.post<any>('/tenant/users', payload);
  }

  public update(usuarioId: number, payload: any): Observable<TenantUser> {
    return this._api.put<TenantUser>(`/tenant/users/${usuarioId}`, payload);
  }

  public remove(usuarioId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/users/${usuarioId}`);
  }

  public resetPassword(usuarioId: number): Observable<any> {
    return this._api.post<any>(`/tenant/users/${usuarioId}/reset-password`, {});
  }
}

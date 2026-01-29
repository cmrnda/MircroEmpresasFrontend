import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantUser = {
  usuario_id: number;
  email: string;
  activo: boolean;
  creado_en?: string | null;
  ultimo_login?: string | null;
  empresa_id: number;
  membership_activo: boolean;
  roles: string[];
};

export type ListTenantUsersResponse = {
  items: TenantUser[];
};

export type CreateTenantUserRequest = {
  email: string;
  password: string;
  roles: string[];
};

export type UpdateTenantUserRequest = {
  roles?: string[];
  new_password?: string;
  membership_activo?: boolean;
  usuario_activo?: boolean;
};

@Injectable({ providedIn: 'root' })
export class TenantUsersApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { q?: string; includeInactivos?: boolean }): Observable<ListTenantUsersResponse> {
    return this._api.get<ListTenantUsersResponse>('/tenant/users', {
      query: {
        q: opts?.q,
        include_inactivos: opts?.includeInactivos ? true : undefined
      }
    });
  }

  public create(payload: CreateTenantUserRequest): Observable<TenantUser> {
    return this._api.post<TenantUser>('/tenant/users', payload);
  }

  public update(usuarioId: number, payload: UpdateTenantUserRequest): Observable<TenantUser> {
    return this._api.put<TenantUser>(`/tenant/users/${usuarioId}`, payload);
  }

  public disable(usuarioId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/users/${usuarioId}`);
  }

  public restore(usuarioId: number): Observable<TenantUser> {
    return this._api.patch<TenantUser>(`/tenant/users/${usuarioId}/restore`, {});
  }
}

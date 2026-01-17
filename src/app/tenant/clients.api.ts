import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../core/http/api-client.service';

export interface TenantClient {
  cliente_id: number;
  empresa_id: number;
  email: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
  activo: boolean;
  creado_en?: string | null;
  ultimo_login?: string | null;
}

export interface CreateClientRequest {
  email: string;
  password: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
}

export interface UpdateClientRequest {
  email?: string;
  password?: string;
  nombre_razon?: string;
  nit_ci?: string | null;
  telefono?: string | null;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(includeInactivos?: boolean): Observable<TenantClient[]> {
    const qs = includeInactivos ? '?include_inactivos=true' : '';
    return this._api.get<TenantClient[]>(`/tenant/clients${qs}`);
  }

  public get(clienteId: number): Observable<TenantClient> {
    return this._api.get<TenantClient>(`/tenant/clients/${clienteId}`);
  }

  public create(payload: CreateClientRequest): Observable<TenantClient> {
    return this._api.post<TenantClient>('/tenant/clients', payload);
  }

  public update(clienteId: number, payload: UpdateClientRequest): Observable<TenantClient> {
    return this._api.put<TenantClient>(`/tenant/clients/${clienteId}`, payload);
  }

  public remove(clienteId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/clients/${clienteId}`);
  }

  public restore(clienteId: number): Observable<TenantClient> {
    return this._api.patch<TenantClient>(`/tenant/clients/${clienteId}/restore`, {});
  }
}

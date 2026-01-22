import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantClient = {
  cliente_id: number;
  email: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;

  activo: boolean;
  link_activo?: boolean;
};

export type ListTenantClientsResponse = {
  items: TenantClient[];
};

export type CreateTenantClientRequest = {
  email: string;
  password: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
};

export type UpdateTenantClientRequest = {
  email?: string;
  nombre_razon?: string;
  nit_ci?: string | null;
  telefono?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TenantClientsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { q?: string; includeInactivos?: boolean }): Observable<ListTenantClientsResponse> {
    const params: string[] = [];
    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.includeInactivos) params.push('include_inactivos=true');
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListTenantClientsResponse>(`/tenant/clients${qs}`);
  }

  public get(clienteId: number, opts?: { includeInactivos?: boolean }): Observable<TenantClient> {
    const params: string[] = [];
    if (opts?.includeInactivos) params.push('include_inactivos=true');
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<TenantClient>(`/tenant/clients/${clienteId}${qs}`);
  }

  public create(payload: CreateTenantClientRequest): Observable<TenantClient> {
    return this._api.post<TenantClient>('/tenant/clients', payload);
  }

  public update(clienteId: number, payload: UpdateTenantClientRequest): Observable<TenantClient> {
    return this._api.put<TenantClient>(`/tenant/clients/${clienteId}`, payload);
  }

  public unlink(clienteId: number): Observable<{ ok: boolean }> {
    return this._api.post<{ ok: boolean }>(`/tenant/clients/${clienteId}/unlink`, {});
  }

  public restoreLink(clienteId: number): Observable<TenantClient> {
    return this._api.post<TenantClient>(`/tenant/clients/${clienteId}/restore-link`, {});
  }
}

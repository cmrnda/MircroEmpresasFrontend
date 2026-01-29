import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type ClientTenantLink = {
  empresa_id: number;
  nombre: string;
  activo: boolean;
};

export type PlatformClient = {
  cliente_id: number;
  email: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
  activo: boolean;
  tenants?: ClientTenantLink[];
};

export type CreatePlatformClientRequest = {
  empresa_id?: number | null;
  email: string;
  password: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
};

export type UpdatePlatformClientRequest = {
  email?: string;
  password?: string;
  nombre_razon?: string;
  nit_ci?: string | null;
  telefono?: string | null;
  activo?: boolean;
};

export type ListPlatformClientsResponse = {
  items: PlatformClient[];
};

@Injectable({ providedIn: 'root' })
export class PlatformClientsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { empresaId?: number; q?: string; includeInactivos?: boolean }): Observable<ListPlatformClientsResponse> {
    return this._api.get<ListPlatformClientsResponse>('/platform/clients', {
      query: {
        empresa_id: opts?.empresaId,
        q: opts?.q,
        include_inactivos: opts?.includeInactivos ? true : undefined
      }
    });
  }

  public get(clienteId: number): Observable<PlatformClient> {
    return this._api.get<PlatformClient>(`/platform/clients/${clienteId}`);
  }

  public create(payload: CreatePlatformClientRequest): Observable<PlatformClient> {
    return this._api.post<PlatformClient>('/platform/clients', payload);
  }

  public update(clienteId: number, payload: UpdatePlatformClientRequest): Observable<PlatformClient> {
    return this._api.put<PlatformClient>(`/platform/clients/${clienteId}`, payload);
  }

  public remove(clienteId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/platform/clients/${clienteId}`);
  }

  public link(clienteId: number, empresaId: number): Observable<PlatformClient> {
    return this._api.post<PlatformClient>(`/platform/clients/${clienteId}/link/${empresaId}`, {});
  }

  public unlink(clienteId: number, empresaId: number): Observable<PlatformClient> {
    return this._api.post<PlatformClient>(`/platform/clients/${clienteId}/unlink/${empresaId}`, {});
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../core/http/api-client.service';

export type PlatformClient = {
  cliente_id: number;
  empresa_id: number;
  email: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
  activo: boolean;
};

export type CreatePlatformClientRequest = {
  empresa_id: number;
  email: string;
  password: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
};

export type UpdatePlatformClientRequest = {
  empresa_id?: number;
  email?: string;
  password?: string;
  nombre_razon?: string;
  nit_ci?: string | null;
  telefono?: string | null;
  activo?: boolean;
};

@Injectable({ providedIn: 'root' })
export class PlatformClientsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { empresaId?: number; q?: string; includeInactivos?: boolean }): Observable<PlatformClient[]> {
    const params: string[] = [];
    if (opts?.empresaId) params.push(`empresa_id=${encodeURIComponent(String(opts.empresaId))}`);
    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.includeInactivos) params.push(`include_inactivos=true`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<PlatformClient[]>(`/platform/clients${qs}`);
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

  public restore(clienteId: number): Observable<PlatformClient> {
    return this._api.patch<PlatformClient>(`/platform/clients/${clienteId}/restore`, {});
  }
}

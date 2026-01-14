import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../core/http/api-client.service';

export type TenantClient = {
  cliente_id: number;
  empresa_id: number;
  email: string;
  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
  activo: boolean;
};

@Injectable({ providedIn: 'root' })
export class ClientsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(): Observable<TenantClient[]> {
    return this._api.get<TenantClient[]>('/tenant/clients');
  }

  public create(payload: any): Observable<any> {
    return this._api.post<any>('/tenant/clients', payload);
  }

  public update(clienteId: number, payload: any): Observable<TenantClient> {
    return this._api.put<TenantClient>(`/tenant/clients/${clienteId}`, payload);
  }

  public remove(clienteId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/clients/${clienteId}`);
  }
}

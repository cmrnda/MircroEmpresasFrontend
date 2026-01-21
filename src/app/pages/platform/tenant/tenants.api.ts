import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export interface Empresa {
  empresa_id: number;
  nombre: string;
  nit?: string | null;
  estado: 'ACTIVA' | 'SUSPENDIDA' | string;
  creado_en?: string | null;
}

export interface CreateTenantRequest {
  nombre: string;
  nit?: string;
  admin: {
    email: string;
    password: string;
  };
}

export interface UpdateTenantRequest {
  nombre?: string;
  nit?: string;
  estado?: 'ACTIVA' | 'SUSPENDIDA' | string;
}

export interface ListTenantsResponse {
  items: Empresa[];
}

@Injectable({ providedIn: 'root' })
export class TenantsApi {

  public constructor(private readonly _api: ApiClientService) {}

  public list(q?: string, estado?: 'ACTIVA' | 'SUSPENDIDA'): Observable<ListTenantsResponse> {
    const params: string[] = [];

    if (q) params.push(`q=${encodeURIComponent(q)}`);

    // contrato real con el backend
    if (estado === 'ACTIVA') params.push('include_inactivos=false');
    if (estado === 'SUSPENDIDA') params.push('include_inactivos=true');

    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListTenantsResponse>(`/platform/tenants${qs}`);
  }

  public create(payload: CreateTenantRequest): Observable<Empresa> {
    return this._api.post<Empresa>('/platform/tenants', payload);
  }

  public update(empresaId: number, payload: UpdateTenantRequest): Observable<Empresa> {
    return this._api.put<Empresa>(`/platform/tenants/${empresaId}`, payload);
  }

  public remove(empresaId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/platform/tenants/${empresaId}`);
  }
}

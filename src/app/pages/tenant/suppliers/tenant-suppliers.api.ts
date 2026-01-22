import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantSupplier = {
  proveedor_id: number;
  empresa_id: number;
  nombre: string;
  nit?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
  activo: boolean;
  creado_en?: string | null;
};

export type ListTenantSuppliersResponse = { items: TenantSupplier[] };

export type CreateTenantSupplierRequest = {
  nombre: string;
  nit?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
};

export type UpdateTenantSupplierRequest = {
  nombre?: string;
  nit?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
  activo?: boolean;
};

@Injectable({ providedIn: 'root' })
export class TenantSuppliersApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { q?: string; includeInactivos?: boolean }): Observable<ListTenantSuppliersResponse> {
    const params: string[] = [];
    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.includeInactivos) params.push('include_inactivos=true');
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListTenantSuppliersResponse>(`/tenant/suppliers${qs}`);
  }

  public create(payload: CreateTenantSupplierRequest): Observable<TenantSupplier> {
    return this._api.post<TenantSupplier>('/tenant/suppliers', payload);
  }

  public update(proveedorId: number, payload: UpdateTenantSupplierRequest): Observable<TenantSupplier> {
    return this._api.put<TenantSupplier>(`/tenant/suppliers/${proveedorId}`, payload);
  }

  public remove(proveedorId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/suppliers/${proveedorId}`);
  }

  public restore(proveedorId: number): Observable<TenantSupplier> {
    return this._api.post<TenantSupplier>(`/tenant/suppliers/${proveedorId}/restore`, {});
  }
}

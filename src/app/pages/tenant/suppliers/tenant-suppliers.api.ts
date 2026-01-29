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

export type TenantSupplierProductsResponse = {
  items?: any[];
  data?: {
    items?: any[];
    [k: string]: any;
  };
  [k: string]: any;
};

@Injectable({ providedIn: 'root' })
export class TenantSuppliersApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { q?: string; includeInactivos?: boolean }): Observable<ListTenantSuppliersResponse> {
    return this._api.get<ListTenantSuppliersResponse>('/tenant/suppliers', {
      query: {
        q: opts?.q,
        include_inactivos: opts?.includeInactivos ? true : undefined
      }
    });
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

  public listProducts(opts?: { proveedorId?: number; q?: string; limit?: number; offset?: number }): Observable<TenantSupplierProductsResponse> {
    return this._api.get<TenantSupplierProductsResponse>('/tenant/suppliers/products', {
      query: {
        proveedor_id: opts?.proveedorId,
        q: opts?.q,
        limit: opts?.limit,
        offset: opts?.offset
      }
    });
  }

  public linkProduct(proveedorId: number, productoId: number): Observable<{ ok: boolean }> {
    return this._api.post<{ ok: boolean }>(`/tenant/suppliers/${encodeURIComponent(String(proveedorId))}/products/${encodeURIComponent(String(productoId))}`, {});
  }

  public unlinkProduct(proveedorId: number, productoId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/suppliers/${encodeURIComponent(String(proveedorId))}/products/${encodeURIComponent(String(productoId))}`);
  }
}

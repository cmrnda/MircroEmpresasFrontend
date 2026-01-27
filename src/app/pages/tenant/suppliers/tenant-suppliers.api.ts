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
  // tu backend hoy devuelve { data: { items: [...] } } en algunos casos
  // yo lo dejo flexible
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

  // ✅ Lista productos (para tu POS o para “productos vinculados del proveedor”)
  // Endpoint que ya estabas usando: GET /tenant/suppliers/products?proveedor_id=...
  public listProducts(opts?: { proveedorId?: number; q?: string; limit?: number; offset?: number }): Observable<TenantSupplierProductsResponse> {
    const params: string[] = [];
    if (opts?.proveedorId) params.push(`proveedor_id=${encodeURIComponent(String(opts.proveedorId))}`);
    if (opts?.q) params.push(`q=${encodeURIComponent(String(opts.q))}`);
    if (opts?.limit != null) params.push(`limit=${encodeURIComponent(String(opts.limit))}`);
    if (opts?.offset != null) params.push(`offset=${encodeURIComponent(String(opts.offset))}`);

    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<TenantSupplierProductsResponse>(`/tenant/suppliers/products${qs}`);
  }

  // ✅ VINCULAR (ajusta si tu ruta real es otra)
  public linkProduct(proveedorId: number, productoId: number): Observable<{ ok: boolean }> {
    return this._api.post<{ ok: boolean }>(`/tenant/suppliers/${encodeURIComponent(String(proveedorId))}/products/${encodeURIComponent(String(productoId))}`, {});
  }

  // ✅ DESVINCULAR (ajusta si tu ruta real es otra)
  public unlinkProduct(proveedorId: number, productoId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/suppliers/${encodeURIComponent(String(proveedorId))}/products/${encodeURIComponent(String(productoId))}`);
  }
}

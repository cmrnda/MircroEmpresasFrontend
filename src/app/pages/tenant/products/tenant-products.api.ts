import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantProduct = {
  producto_id: number;
  empresa_id: number;
  categoria_id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock: number;
  stock_min: number;
  activo: boolean;

  image_url?: string | null;
  primary_image_url?: string | null;
  cantidad_actual?: number | null;
};

export type ListTenantProductsResponse = {
  items: TenantProduct[];
};

export type CreateTenantProductRequest = {
  categoria_id: number;
  codigo: string;
  descripcion: string;
  precio?: number | null;
  stock?: number | null;
  stock_min?: number | null;
  image_url?: string | null;
};

export type UpdateTenantProductRequest = {
  categoria_id?: number;
  codigo?: string;
  descripcion?: string;
  precio?: number | null;
  stock?: number | null;
  stock_min?: number | null;
  activo?: boolean;
  image_url?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TenantProductsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { q?: string; categoriaId?: number; includeInactivos?: boolean }): Observable<ListTenantProductsResponse> {
    const params: string[] = [];
    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.categoriaId) params.push(`categoria_id=${encodeURIComponent(String(opts.categoriaId))}`);
    if (opts?.includeInactivos) params.push('include_inactivos=true');
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListTenantProductsResponse>(`/tenant/products${qs}`);
  }

  public get(productoId: number, opts?: { includeInactivos?: boolean }): Observable<TenantProduct> {
    const params: string[] = [];
    if (opts?.includeInactivos) params.push('include_inactivos=true');
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<TenantProduct>(`/tenant/products/${productoId}${qs}`);
  }

  public create(payload: CreateTenantProductRequest): Observable<TenantProduct> {
    return this._api.post<TenantProduct>('/tenant/products', payload);
  }

  public update(productoId: number, payload: UpdateTenantProductRequest): Observable<TenantProduct> {
    return this._api.put<TenantProduct>(`/tenant/products/${productoId}`, payload);
  }

  public remove(productoId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/products/${productoId}`);
  }

  public restore(productoId: number): Observable<TenantProduct> {
    return this._api.post<TenantProduct>(`/tenant/products/${productoId}/restore`, {});
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PublicTenant = {
  empresa_id: number;
  nombre: string;
  nit: string | null;
  logo_url: string | null;
  image_url: string | null;
  descripcion: string | null;
};

export type ListPublicTenantsResponse = {
  items: PublicTenant[];
  page: number;
  page_size: number;
  total: number;
};

export type PublicProduct = {
  producto_id: number;
  empresa_id: number;
  categoria_id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock_min: number;
  cantidad_actual: number;
  primary_image_url: string | null;

  empresa_nombre?: string | null;
  store_logo_url?: string | null;
  store_image_url?: string | null;
};

@Injectable({ providedIn: 'root' })
export class PublicMarketApi {
  public constructor(private readonly _api: ApiClientService) {}

  public listTenants(opts?: { q?: string; page?: number; pageSize?: number }): Observable<ListPublicTenantsResponse> {
    const params: string[] = [];
    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.page != null) params.push(`page=${encodeURIComponent(String(opts.page))}`);
    if (opts?.pageSize != null) params.push(`page_size=${encodeURIComponent(String(opts.pageSize))}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListPublicTenantsResponse>(`/shop/public/tenants${qs}`);
  }

  public getTenant(empresa_id: number): Observable<PublicTenant> {
    return this._api.get<PublicTenant>(`/shop/public/tenants/${empresa_id}`);
  }

  public randomProducts(limit = 12): Observable<{ items: PublicProduct[] }> {
    return this._api.get<{ items: PublicProduct[] }>(`/shop/public/products/random?limit=${encodeURIComponent(String(limit))}`);
  }

  public randomProductsByTenant(empresa_id: number, limit = 12): Observable<{ items: PublicProduct[] }> {
    return this._api.get<{ items: PublicProduct[] }>(`/shop/public/tenants/${empresa_id}/products/random?limit=${encodeURIComponent(String(limit))}`);
  }
}

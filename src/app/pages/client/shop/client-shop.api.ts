import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PublicCategory = {
  categoria_id: number;
  empresa_id: number;
  nombre: string;
};

export type ShopProduct = {
  producto_id: number;
  empresa_id: number;
  categoria_id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock_min: number;
  cantidad_actual: number;
  primary_image_url: string | null;
};

export type PublicProductsResponse = {
  items: ShopProduct[];
  page: number;
  page_size: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class ClientShopApi {
  public constructor(private readonly _api: ApiClientService) {}

  public listCategories(empresa_id: number): Observable<PublicCategory[]> {
    return this._api.get<PublicCategory[]>(`/shop/${empresa_id}/categories`);
  }

  public listProducts(
    empresa_id: number,
    opts?: { q?: string; categoriaId?: number | null; page?: number; pageSize?: number }
  ): Observable<PublicProductsResponse> {
    const params: string[] = [];

    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.categoriaId != null) params.push(`categoria_id=${encodeURIComponent(String(opts.categoriaId))}`);
    if (opts?.page != null) params.push(`page=${encodeURIComponent(String(opts.page))}`);
    if (opts?.pageSize != null) params.push(`page_size=${encodeURIComponent(String(opts.pageSize))}`);

    const qs = params.length ? `?${params.join('&')}` : '';

    return this._api.get<PublicProductsResponse>(`/shop/${empresa_id}/products${qs}`).pipe(
      map((res) => {
        const items = (res?.items || []).filter((p) => (p?.cantidad_actual ?? 0) > 0);
        return {
          items,
          page: Number(res?.page ?? 1),
          page_size: Number(res?.page_size ?? (opts?.pageSize ?? 20)),
          total: Number(res?.total ?? items.length)
        };
      })
    );
  }

  public getProduct(empresa_id: number, producto_id: number): Observable<ShopProduct> {
    return this._api.get<ShopProduct>(`/shop/${empresa_id}/products/${producto_id}`);
  }
}

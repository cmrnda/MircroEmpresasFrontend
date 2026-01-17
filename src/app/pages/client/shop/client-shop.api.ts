import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../../../core/http/api-base';

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
  public constructor(private readonly _http: HttpClient) {}

  public listCategories(empresa_id: number): Observable<PublicCategory[]> {
    return this._http.get<PublicCategory[]>(`${API_BASE}/shop/${empresa_id}/categories`);
  }

  public listProducts(
    empresa_id: number,
    args: { q?: string | null; categoria_id?: number | null; page?: number; page_size?: number } = {}
  ): Observable<PublicProductsResponse> {
    const qs: string[] = [];

    if (args.q) qs.push(`q=${encodeURIComponent(String(args.q))}`);
    if (args.categoria_id != null) qs.push(`categoria_id=${encodeURIComponent(String(args.categoria_id))}`);
    if (args.page != null) qs.push(`page=${encodeURIComponent(String(args.page))}`);
    if (args.page_size != null) qs.push(`page_size=${encodeURIComponent(String(args.page_size))}`);

    const qstr = qs.length ? `?${qs.join('&')}` : '';
    return this._http.get<PublicProductsResponse>(`${API_BASE}/shop/${empresa_id}/products${qstr}`);
  }
}

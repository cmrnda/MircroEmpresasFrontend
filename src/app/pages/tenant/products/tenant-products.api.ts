import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE} from '../../../core/http/api-base';
import {Observable} from 'rxjs';

export type TenantProduct = {
  producto_id: number;
  empresa_id: number;
  categoria_id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock_min: number;
  activo: boolean;
};

export type TenantProductImage = {
  image_id: number;
  url: string;
  mime_type: string;
  file_size: number;
  is_primary: boolean;
  created_at: string | null;
};

@Injectable({providedIn: 'root'})
export class TenantProductsApi {
  public constructor(private readonly _http: HttpClient) {
  }

  public list(params: {
    include_inactivos: boolean;
    categoria_id?: number | null;
    q?: string | null
  }): Observable<TenantProduct[]> {
    const qs: string[] = [];
    if (params.include_inactivos) qs.push('include_inactivos=true');
    if (params.categoria_id != null) qs.push(`categoria_id=${encodeURIComponent(String(params.categoria_id))}`);
    if (params.q) qs.push(`q=${encodeURIComponent(String(params.q))}`);
    const qstr = qs.length ? `?${qs.join('&')}` : '';
    return this._http.get<TenantProduct[]>(`${API_BASE}/tenant/products${qstr}`);
  }

  public create(payload: {
    categoria_id: number;
    codigo: string;
    descripcion: string;
    precio: number;
    stock_min?: number
  }): Observable<TenantProduct> {
    return this._http.post<TenantProduct>(`${API_BASE}/tenant/products`, payload);
  }

  public update(producto_id: number, payload: Partial<TenantProduct>): Observable<TenantProduct | { error: string }> {
    return this._http.put<TenantProduct | { error: string }>(`${API_BASE}/tenant/products/${producto_id}`, payload);
  }

  public remove(producto_id: number): Observable<{ ok: boolean } | { error: string }> {
    return this._http.delete<{ ok: boolean } | { error: string }>(`${API_BASE}/tenant/products/${producto_id}`);
  }

  public restore(producto_id: number): Observable<TenantProduct | { error: string }> {
    return this._http.patch<TenantProduct | {
      error: string
    }>(`${API_BASE}/tenant/products/${producto_id}/restore`, {});
  }

  public listImages(producto_id: number): Observable<TenantProductImage[]> {
    return this._http.get<TenantProductImage[]>(`${API_BASE}/tenant/products/${producto_id}/images`);
  }

  public uploadImage(producto_id: number, file: File, is_primary: boolean): Observable<TenantProductImage> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('is_primary', is_primary ? 'true' : 'false');
    return this._http.post<TenantProductImage>(`${API_BASE}/tenant/products/${producto_id}/images`, fd);
  }

  public setPrimary(producto_id: number, image_id: number): Observable<TenantProductImage> {
    return this._http.patch<TenantProductImage>(`${API_BASE}/tenant/products/${producto_id}/images/${image_id}/primary`, {});
  }

  public deleteImage(producto_id: number, image_id: number): Observable<{ ok: boolean }> {
    return this._http.delete<{ ok: boolean }>(`${API_BASE}/tenant/products/${producto_id}/images/${image_id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../../core/http/api-base';
import { Observable } from 'rxjs';

export type TenantInventoryItem = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
  stock_min: number;
  cantidad_actual: number;
};

export type TenantInventoryList = {
  items: TenantInventoryItem[];
  page: number;
  page_size: number;
  total: number;
};

@Injectable({ providedIn: 'root' })
export class TenantInventoryApi {
  public constructor(private readonly _http: HttpClient) {}

  public list(params: { q?: string | null; page: number; page_size: number; include_inactivos: boolean }): Observable<TenantInventoryList> {
    const qs: string[] = [];
    if (params.q) qs.push(`q=${encodeURIComponent(String(params.q))}`);
    qs.push(`page=${encodeURIComponent(String(params.page))}`);
    qs.push(`page_size=${encodeURIComponent(String(params.page_size))}`);
    if (params.include_inactivos) qs.push('include_inactivos=true');
    return this._http.get<TenantInventoryList>(`${API_BASE}/tenant/inventory?${qs.join('&')}`);
  }

  public adjust(payload: { producto_id: number; delta: number; tipo?: string; ref_tabla?: string; ref_id?: number }): Observable<any> {
    return this._http.post<any>(`${API_BASE}/tenant/inventory/adjust`, payload);
  }
}

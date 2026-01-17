import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../../core/http/api-base';
import { Observable } from 'rxjs';

export type TenantCategory = {
  categoria_id: number;
  empresa_id: number;
  nombre: string;
  activo: boolean;
};

@Injectable({ providedIn: 'root' })
export class TenantCategoriesApi {
  public constructor(private readonly _http: HttpClient) {}

  public list(include_inactivos: boolean): Observable<TenantCategory[]> {
    const qs = include_inactivos ? '?include_inactivos=true' : '';
    return this._http.get<TenantCategory[]>(`${API_BASE}/tenant/categories${qs}`);
  }

  public create(payload: { nombre: string }): Observable<TenantCategory> {
    return this._http.post<TenantCategory>(`${API_BASE}/tenant/categories`, payload);
  }

  public update(categoria_id: number, payload: { nombre?: string; activo?: boolean }): Observable<TenantCategory | { error: string }> {
    return this._http.put<TenantCategory | { error: string }>(`${API_BASE}/tenant/categories/${categoria_id}`, payload);
  }

  public remove(categoria_id: number): Observable<{ ok: boolean } | { error: string }> {
    return this._http.delete<{ ok: boolean } | { error: string }>(`${API_BASE}/tenant/categories/${categoria_id}`);
  }

  public restore(categoria_id: number): Observable<TenantCategory | { error: string }> {
    return this._http.patch<TenantCategory | { error: string }>(`${API_BASE}/tenant/categories/${categoria_id}/restore`, {});
  }
}

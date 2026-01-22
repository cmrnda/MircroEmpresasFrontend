import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantCategory = {
  categoria_id: number;
  empresa_id: number;
  nombre: string;
  activo: boolean;
};

export type ListTenantCategoriesResponse = {
  items: TenantCategory[];
};

export type CreateTenantCategoryRequest = {
  nombre: string;
};

export type UpdateTenantCategoryRequest = {
  nombre?: string;
  activo?: boolean;
};

@Injectable({ providedIn: 'root' })
export class TenantCategoriesApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { q?: string; includeInactivos?: boolean }): Observable<ListTenantCategoriesResponse> {
    const params: string[] = [];
    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.includeInactivos) params.push('include_inactivos=true');
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListTenantCategoriesResponse>(`/tenant/categories${qs}`);
  }

  public get(categoriaId: number, opts?: { includeInactivos?: boolean }): Observable<TenantCategory> {
    const params: string[] = [];
    if (opts?.includeInactivos) params.push('include_inactivos=true');
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<TenantCategory>(`/tenant/categories/${categoriaId}${qs}`);
  }

  public create(payload: CreateTenantCategoryRequest): Observable<TenantCategory> {
    return this._api.post<TenantCategory>('/tenant/categories', payload);
  }

  public update(categoriaId: number, payload: UpdateTenantCategoryRequest): Observable<TenantCategory> {
    return this._api.put<TenantCategory>(`/tenant/categories/${categoriaId}`, payload);
  }

  public remove(categoriaId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/tenant/categories/${categoriaId}`);
  }

  public restore(categoriaId: number): Observable<TenantCategory> {
    return this._api.post<TenantCategory>(`/tenant/categories/${categoriaId}/restore`, {});
  }
}

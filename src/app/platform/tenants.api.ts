import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiClientService} from '../core/http/api-client.service';

export type Empresa = {
  empresa_id: number;
  nombre: string;
  nit?: string | null;
  estado: string;
  creado_en?: string | null;
};

export type CreateTenantRequest = {
  nombre: string;
  nit?: string;
  admin: { email: string; password: string };
};

@Injectable({providedIn: 'root'})
export class TenantsApi {
  public constructor(private readonly _api: ApiClientService) {
  }

  public list(): Observable<Empresa[]> {
    return this._api.get<Empresa[]>('/platform/tenants');
  }

  public create(payload: CreateTenantRequest): Observable<any> {
    return this._api.post<any>('/platform/tenants', payload);
  }

  public remove(empresaId: number): Observable<{ ok: boolean }> {
    return this._api.delete<{ ok: boolean }>(`/platform/tenants/${empresaId}`);
  }
}

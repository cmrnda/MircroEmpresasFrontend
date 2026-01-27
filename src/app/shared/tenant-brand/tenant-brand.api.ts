import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/http/api-client.service';

export type TenantBrandResponse = {
  empresa_id: number;
  empresa_nombre: string | null;
  logo_url: string | null;
  actualizado_en: string | null;
};

@Injectable({ providedIn: 'root' })
export class TenantBrandApi {
  public constructor(private readonly _api: ApiClientService) {}

  public getBrand(): Observable<TenantBrandResponse> {
    return this._api.get<TenantBrandResponse>('/tenant/brand');
  }

  public getPublicBrand(empresa_id: number): Observable<TenantBrandResponse> {
    return this._api.get<TenantBrandResponse>(`/public/brand/${Number(empresa_id)}`);
  }
}

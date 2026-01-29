import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantSettings = {
  empresa_id: number;
  empresa_nombre: string | null;
  moneda: string;
  tasa_impuesto: number;
  logo_url: string | null;
  image_url: string | null;
  descripcion: string | null;
  actualizado_en: string | null;
};

export type UpdateTenantSettingsRequest = {
  moneda?: string;
  tasa_impuesto?: number;
  logo_url?: string | null;
  image_url?: string | null;
  descripcion?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TenantSettingsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public get(): Observable<TenantSettings> {
    return this._api.get<TenantSettings>('/tenant/settings');
  }

  public update(payload: UpdateTenantSettingsRequest): Observable<TenantSettings> {
    return this._api.put<TenantSettings>('/tenant/settings', payload);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantProductImage = {
  empresa_id: number;
  producto_id: number;
  file_path: string;
  url: string;
  mime_type: string;
  file_size?: number | null;
  updated_at?: string | null;
};

export type SetTenantProductImageRequest = {
  file_path: string;
  url: string;
  mime_type: string;
};

@Injectable({ providedIn: 'root' })
export class TenantProductImageApi {
  public constructor(private readonly _api: ApiClientService) {}

  public get(productoId: number): Observable<TenantProductImage> {
    return this._api.get<TenantProductImage>(`/tenant/products/${productoId}/image`);
  }

  public set(productoId: number, payload: SetTenantProductImageRequest): Observable<TenantProductImage> {
    return this._api.put<TenantProductImage>(`/tenant/products/${productoId}/image`, payload);
  }

  public remove(productoId: number): Observable<{ ok: boolean; data: TenantProductImage }> {
    return this._api.delete<{ ok: boolean; data: TenantProductImage }>(`/tenant/products/${productoId}/image`);
  }
}

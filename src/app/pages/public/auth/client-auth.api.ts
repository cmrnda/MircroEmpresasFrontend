import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type ClientAuthResponse = {
  data: {
    access_token: string;
    cliente: any;
  };
};

@Injectable({ providedIn: 'root' })
export class ClientAuthApi {
  public constructor(private readonly _api: ApiClientService) {}

  public login(empresa_id: number, payload: { email: string; password: string }): Observable<{ access_token: string; cliente: any }> {
    return this._api.post<ClientAuthResponse>(`/shop/${empresa_id}/auth/login`, payload).pipe(
      map((res) => ({ access_token: res.data.access_token, cliente: res.data.cliente }))
    );
  }

  public register(
    empresa_id: number,
    payload: { email: string; password: string; nombre_razon: string; nit_ci?: string | null; telefono?: string | null }
  ): Observable<{ access_token: string; cliente: any }> {
    return this._api.post<ClientAuthResponse>(`/shop/${empresa_id}/auth/register`, payload).pipe(
      map((res) => ({ access_token: res.data.access_token, cliente: res.data.cliente }))
    );
  }
}

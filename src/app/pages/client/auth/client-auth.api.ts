import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://127.0.0.1:5000';

export type ClientLoginRequest = {
  email: string;
  password: string;
  empresa_id: number;
};

export type ClientRegisterRequest = {
  email: string;
  password: string;
  empresa_id: number;

  nombre_razon: string;
  nit_ci?: string | null;
  telefono?: string | null;
};

export type ClientLoginResponse = {
  access_token: string;
  refresh_token: string;
  cliente: {
    cliente_id: number;
    email: string;
  };
  empresa_id: number;
};

export type ClientRegisterResponse = ClientLoginResponse;

@Injectable({ providedIn: 'root' })
export class ClientAuthApi {
  public constructor(private readonly _http: HttpClient) {}

  public login(payload: ClientLoginRequest): Observable<ClientLoginResponse> {
    return this._http.post<ClientLoginResponse>(`${BASE}/auth/client/login`, payload);
  }

  public register(payload: ClientRegisterRequest): Observable<ClientRegisterResponse> {
    return this._http.post<ClientRegisterResponse>(`${BASE}/auth/client/register`, payload);
  }
}

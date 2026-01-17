import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../../core/http/api-base';
import { Observable } from 'rxjs';

export type CheckoutPayload = {
  items: Array<{ producto_id: number; cantidad: number }>;
  envio?: {
    departamento: string;
    ciudad: string;
    zona_barrio?: string | null;
    direccion_linea: string;
    referencia?: string | null;
    telefono_receptor?: string | null;
    costo_envio?: number;
  } | null;
};

@Injectable({ providedIn: 'root' })
export class ClientCheckoutApi {
  public constructor(private readonly _http: HttpClient) {}

  public createOrder(empresa_id: number, payload: CheckoutPayload): Observable<{ venta_id: number }> {
    return this._http.post<{ venta_id: number }>(`${API_BASE}/shop/${empresa_id}/orders`, payload);
  }
}

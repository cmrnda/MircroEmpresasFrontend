import { Injectable } from '@angular/core';
import { ApiClientService } from '../core/http/api-client.service';
import { Observable } from 'rxjs';

export type Plan = {
  plan_id: number;
  nombre: string;
  precio: number;
  periodo_cobro: string;
};

export type Suscripcion = {
  suscripcion_id: number;
  empresa_id: number;
  plan_id: number;
  estado: string;
  inicio: string;
  fin?: string | null;
  renovacion?: string | null;
};

@Injectable({ providedIn: 'root' })
export class PlatformSubscriptionsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(empresaId?: number): Observable<Suscripcion[]> {
    return this._api.get<Suscripcion[]>(
      empresaId ? `/platform/subscriptions?empresa_id=${empresaId}` : `/platform/subscriptions`
    );
  }

  public plans(): Observable<Plan[]> {
    return this._api.get<Plan[]>('/platform/subscriptions/plans');
  }

  public create(data: { empresa_id: number; plan_id: number }): Observable<any> {
    return this._api.post('/platform/subscriptions', data);
  }

  public pay(data: {
    empresa_id: number;
    suscripcion_id: number;
    monto: number;
    metodo: string;
    moneda?: string;
    referencia_qr?: string;
  }): Observable<any> {
    return this._api.post('/platform/subscriptions/payments', data);
  }
}

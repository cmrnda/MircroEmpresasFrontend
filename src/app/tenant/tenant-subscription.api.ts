import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../core/http/api-client.service';

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

export type SuscripcionStatus = {
  empresa_id: number;
  empresa_estado: string;
  suscripcion: Suscripcion | null;
  plan: Plan | null;
  is_active: boolean;
  remaining_days: number | null;
  last_pago: any | null;
};

@Injectable({ providedIn: 'root' })
export class TenantSubscriptionApi {
  public constructor(private readonly _api: ApiClientService) {}

  public status(): Observable<SuscripcionStatus> {
    return this._api.get<SuscripcionStatus>('/tenant/subscription');
  }

  public plans(): Observable<Plan[]> {
    return this._api.get<Plan[]>('/tenant/subscription/plans');
  }

  public select(planId: number): Observable<any> {
    return this._api.post('/tenant/subscription/select', { plan_id: planId });
  }

  public pay(data: { suscripcion_id: number; monto: number; metodo: string; referencia_qr?: string }): Observable<any> {
    return this._api.post('/tenant/subscription/payments', data);
  }
}

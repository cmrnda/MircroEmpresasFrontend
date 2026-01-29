import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PlatformSubscriptionRow = {
  empresa_id: number;
  empresa_nombre: string;
  empresa_estado: string;
  plan_id: number | null;
  suscripcion_estado: string | null;
  suscripcion_inicio: string | null;
  suscripcion_fin: string | null;
  suscripcion_renovacion: string | null;
  ultimo_pago_monto: number | null;
  ultimo_pago_moneda: string | null;
  ultimo_pago_metodo: string | null;
  ultimo_pago_referencia_qr: string | null;
  ultimo_pago_estado: string | null;
  ultimo_pagado_en: string | null;
};

export type ListPlatformSubscriptionsResponse = {
  items: PlatformSubscriptionRow[];
};

export type UpdatePlatformSubscriptionRequest = Partial<{
  plan_id: number | null;
  suscripcion_estado: string | null;
  suscripcion_inicio: string | null;
  suscripcion_fin: string | null;
  suscripcion_renovacion: string | null;
  ultimo_pago_monto: number | null;
  ultimo_pago_moneda: string | null;
  ultimo_pago_metodo: string | null;
  ultimo_pago_referencia_qr: string | null;
  ultimo_pago_estado: string | null;
  ultimo_pagado_en: string | null;
}>;

@Injectable({ providedIn: 'root' })
export class PlatformSubscriptionsApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { includeInactivos?: boolean }): Observable<ListPlatformSubscriptionsResponse> {
    return this._api.get<ListPlatformSubscriptionsResponse>('/platform/subscriptions', {
      query: {
        include_inactivos: opts?.includeInactivos ? true : undefined
      }
    });
  }

  public get(empresaId: number): Observable<PlatformSubscriptionRow> {
    return this._api.get<PlatformSubscriptionRow>(`/platform/subscriptions/${empresaId}`);
  }

  public update(empresaId: number, payload: UpdatePlatformSubscriptionRequest): Observable<PlatformSubscriptionRow> {
    return this._api.put<PlatformSubscriptionRow>(`/platform/subscriptions/${empresaId}`, payload);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantOrder = {
  venta_id: number;
  empresa_id: number;
  cliente_id: number;

  fecha_hora: string;
  total: number;
  descuento_total: number;
  estado: string;

  pago_metodo?: string | null;
  pago_monto?: number | null;
  pago_referencia_qr?: string | null;
  pago_estado?: string | null;
  pagado_en?: string | null;

  envio_departamento?: string | null;
  envio_ciudad?: string | null;
  envio_zona_barrio?: string | null;
  envio_direccion_linea?: string | null;
  envio_referencia?: string | null;
  envio_telefono_receptor?: string | null;
  envio_costo?: number | null;
  envio_estado?: string | null;
  envio_tracking?: string | null;
  envio_fecha_despacho?: string | null;
  envio_fecha_entrega?: string | null;

  confirmado_por_usuario_id?: number | null;
  confirmado_en?: string | null;
};

export type TenantOrderDetail = {
  venta_detalle_id: number;
  empresa_id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unit: number;
  descuento: number;
  subtotal: number;
};

export type TenantOrderFull = TenantOrder & {
  detalle: TenantOrderDetail[];
};

export type ListTenantOrdersResponse = {
  items: TenantOrder[];
};

export type ShipOrderRequest = {
  envio_departamento?: string | null;
  envio_ciudad?: string | null;
  envio_zona_barrio?: string | null;
  envio_direccion_linea?: string | null;
  envio_referencia?: string | null;
  envio_telefono_receptor?: string | null;
  envio_costo?: number | null;
  envio_tracking?: string | null;
  envio_estado?: string | null;
  envio_fecha_despacho?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TenantOrdersApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { estado?: string; clienteId?: number }): Observable<ListTenantOrdersResponse> {
    const params: string[] = [];
    if (opts?.estado) params.push(`estado=${encodeURIComponent(opts.estado)}`);
    if (opts?.clienteId) params.push(`cliente_id=${encodeURIComponent(String(opts.clienteId))}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListTenantOrdersResponse>(`/tenant/orders${qs}`);
  }

  public get(ventaId: number): Observable<TenantOrderFull> {
    return this._api.get<TenantOrderFull>(`/tenant/orders/${ventaId}`);
  }

  public ship(ventaId: number, payload: ShipOrderRequest): Observable<TenantOrderFull> {
    return this._api.post<TenantOrderFull>(`/tenant/orders/${ventaId}/ship`, payload);
  }

  public complete(ventaId: number): Observable<TenantOrderFull> {
    return this._api.post<TenantOrderFull>(`/tenant/orders/${ventaId}/complete`, {});
  }
}

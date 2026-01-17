import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../../core/http/api-base';
import { Observable } from 'rxjs';

export type TenantOrderItem = {
  venta_id: number;
  cliente_id: number;
  fecha_hora: string | null;
  total: number;
  estado: string;
};

export type TenantOrdersList = {
  items: TenantOrderItem[];
  page: number;
  page_size: number;
  total: number;
};

export type TenantOrderDetail = {
  venta: TenantOrderItem;
  detalles: Array<{
    venta_detalle_id: number;
    producto_id: number;
    cantidad: number;
    precio_unit: number;
    subtotal: number;
  }>;
  envio: null | {
    envio_id: number;
    departamento: string;
    ciudad: string;
    direccion_linea: string;
    estado_envio: string;
    tracking: string | null;
    fecha_despacho: string | null;
    fecha_entrega: string | null;
  };
};

@Injectable({ providedIn: 'root' })
export class TenantOrdersApi {
  public constructor(private readonly _http: HttpClient) {}

  public list(params: { estado?: string | null; page: number; page_size: number }): Observable<TenantOrdersList> {
    const qs: string[] = [];
    if (params.estado) qs.push(`estado=${encodeURIComponent(String(params.estado))}`);
    qs.push(`page=${encodeURIComponent(String(params.page))}`);
    qs.push(`page_size=${encodeURIComponent(String(params.page_size))}`);
    return this._http.get<TenantOrdersList>(`${API_BASE}/tenant/orders?${qs.join('&')}`);
  }

  public get(venta_id: number): Observable<TenantOrderDetail> {
    return this._http.get<TenantOrderDetail>(`${API_BASE}/tenant/orders/${venta_id}`);
  }

  public ship(venta_id: number, tracking?: string | null): Observable<any> {
    return this._http.patch<any>(`${API_BASE}/tenant/orders/${venta_id}/ship`, { tracking: tracking || null });
  }

  public complete(venta_id: number): Observable<any> {
    return this._http.patch<any>(`${API_BASE}/tenant/orders/${venta_id}/complete`, {});
  }
}

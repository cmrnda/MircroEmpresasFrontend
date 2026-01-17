import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../../../core/http/api-base';
import { Observable } from 'rxjs';

export type MyOrderItem = {
  venta_id: number;
  empresa_id: number;
  cliente_id: number;
  fecha_hora: string | null;
  total: number;
  descuento_total: number;
  estado: string;
  confirmado_en: string | null;
};

export type MyOrdersList = {
  items: MyOrderItem[];
  page: number;
  page_size: number;
  total: number;
};

export type MyOrderDetail = {
  venta: MyOrderItem;
  detalles: Array<{
    venta_detalle_id: number;
    producto_id: number;
    cantidad: number;
    precio_unit: number;
    descuento: number;
    subtotal: number;
  }>;
  envio: null | {
    envio_id: number;
    departamento: string;
    ciudad: string;
    zona_barrio: string | null;
    direccion_linea: string;
    referencia: string | null;
    telefono_receptor: string | null;
    costo_envio: number;
    estado_envio: string;
    tracking: string | null;
    fecha_despacho: string | null;
    fecha_entrega: string | null;
  };
};

@Injectable({ providedIn: 'root' })
export class ClientOrdersApi {
  public constructor(private readonly _http: HttpClient) {}

  public listMy(empresa_id: number, page: number, page_size: number): Observable<MyOrdersList> {
    return this._http.get<MyOrdersList>(`${API_BASE}/shop/${empresa_id}/orders/my?page=${page}&page_size=${page_size}`);
  }

  public getMy(empresa_id: number, venta_id: number): Observable<MyOrderDetail> {
    return this._http.get<MyOrderDetail>(`${API_BASE}/shop/${empresa_id}/orders/my/${venta_id}`);
  }
}

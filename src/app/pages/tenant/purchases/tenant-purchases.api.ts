import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PurchaseDetail = {
  compra_detalle_id: number;
  empresa_id: number;
  compra_id: number;
  producto_id: number;
  cantidad: number;
  costo_unit: number;
  subtotal: number;
};

export type TenantPurchase = {
  compra_id: number;
  empresa_id: number;
  proveedor_id: number;
  fecha_hora: string;
  total: number;
  estado: 'CREADA' | 'RECIBIDA' | 'ANULADA';
  observacion?: string | null;
  recibido_por_usuario_id?: number | null;
  recibido_en?: string | null;
  detalle?: PurchaseDetail[];
};

export type ListTenantPurchasesResponse = { items: TenantPurchase[] };

export type CreateTenantPurchaseRequest = {
  proveedor_id: number;
  observacion?: string | null;
  detalle: Array<{
    producto_id: number;
    cantidad: number;
    costo_unit: number;
  }>;
};

@Injectable({ providedIn: 'root' })
export class TenantPurchasesApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { proveedorId?: number; estado?: string }): Observable<ListTenantPurchasesResponse> {
    const params: string[] = [];
    if (opts?.proveedorId) params.push(`proveedor_id=${encodeURIComponent(String(opts.proveedorId))}`);
    if (opts?.estado) params.push(`estado=${encodeURIComponent(String(opts.estado))}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<ListTenantPurchasesResponse>(`/tenant/purchases${qs}`);
  }

  public get(compraId: number): Observable<TenantPurchase> {
    return this._api.get<TenantPurchase>(`/tenant/purchases/${compraId}`);
  }

  public create(payload: CreateTenantPurchaseRequest): Observable<TenantPurchase> {
    return this._api.post<TenantPurchase>('/tenant/purchases', payload);
  }

  public receive(compraId: number): Observable<TenantPurchase> {
    return this._api.post<TenantPurchase>(`/tenant/purchases/${compraId}/receive`, {});
  }

  public cancel(compraId: number): Observable<TenantPurchase> {
    return this._api.post<TenantPurchase>(`/tenant/purchases/${compraId}/cancel`, {});
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PurchaseSupplier = {
  proveedor_id: number;
  empresa_id: number;
  nombre: string;
  nit?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  email?: string | null;
};

export type PurchaseProduct = {
  producto_id: number;
  empresa_id: number;
  categoria_id: number;
  codigo: string;
  descripcion: string;
  image_url?: string | null;
};

export type PurchaseDetail = {
  compra_detalle_id: number;
  empresa_id: number;
  compra_id: number;
  producto_id: number;
  cantidad: number;
  costo_unit: number;
  subtotal: number;
  lote?: string | null;
  fecha_vencimiento?: string | null;
  producto?: PurchaseProduct | null;
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
  proveedor?: PurchaseSupplier | null;
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
    lote?: string | null;
    fecha_vencimiento?: string | null;
  }>;
};

export type AddPurchaseItemRequest = {
  producto_id: number;
  cantidad: number;
  costo_unit: number;
  lote?: string | null;
  fecha_vencimiento?: string | null;
};

export type UpdatePurchaseItemRequest = {
  cantidad?: number;
  costo_unit?: number;
  lote?: string | null;
  fecha_vencimiento?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TenantPurchasesApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(opts?: { proveedorId?: number; estado?: string }): Observable<ListTenantPurchasesResponse> {
    return this._api.get<ListTenantPurchasesResponse>('/tenant/purchases', {
      query: {
        proveedor_id: opts?.proveedorId,
        estado: opts?.estado
      }
    });
  }

  public get(compraId: number): Observable<TenantPurchase> {
    return this._api.get<TenantPurchase>(`/tenant/purchases/${compraId}`);
  }

  public create(payload: CreateTenantPurchaseRequest): Observable<TenantPurchase> {
    return this._api.post<TenantPurchase>('/tenant/purchases', payload);
  }

  public addItem(compraId: number, payload: AddPurchaseItemRequest): Observable<TenantPurchase> {
    return this._api.post<TenantPurchase>(`/tenant/purchases/${compraId}/items`, payload);
  }

  public updateItem(compraId: number, compraDetalleId: number, payload: UpdatePurchaseItemRequest): Observable<TenantPurchase> {
    return this._api.put<TenantPurchase>(`/tenant/purchases/${compraId}/items/${compraDetalleId}`, payload);
  }

  public deleteItem(compraId: number, compraDetalleId: number): Observable<TenantPurchase> {
    return this._api.delete<TenantPurchase>(`/tenant/purchases/${compraId}/items/${compraDetalleId}`);
  }

  public receive(compraId: number): Observable<TenantPurchase> {
    return this._api.post<TenantPurchase>(`/tenant/purchases/${compraId}/receive`, {});
  }

  public cancel(compraId: number): Observable<TenantPurchase> {
    return this._api.post<TenantPurchase>(`/tenant/purchases/${compraId}/cancel`, {});
  }

  public downloadPdf(compraId: number): Observable<Blob> {
    return this._api.getBlob(`/tenant/purchases/${compraId}/pdf`);
  }
}

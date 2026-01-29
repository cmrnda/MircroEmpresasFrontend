import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PosCategory = {
  categoria_id: number;
  empresa_id: number;
  nombre: string;
};

export type PosProduct = {
  producto_id: number;
  empresa_id: number;
  categoria_id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  stock_min: number;
  cantidad_actual: number;
  primary_image_url: string | null;
};

export type PosProductsResponse = {
  items: PosProduct[];
  page: number;
  page_size: number;
  total: number;
};

export type PosClient = {
  cliente_id: number;
  email: string;
  nombre_razon: string;
  nit_ci: string | null;
  telefono: string | null;
  activo: boolean;
  creado_en: string | null;
  ultimo_login: string | null;
};

export type PosLookupClientResponse = {
  found: boolean;
  client: PosClient | null;
};

export type PosCreateClientPayload = {
  nit_ci?: string | null;
  nombre_razon: string;
  telefono?: string | null;
  email?: string | null;
};

export type PosSaleItem = {
  producto_id: number;
  cantidad: number;
  precio_unit?: number | null;
  descuento?: number | null;
};

export type PosSaleClientPayload =
  | { cliente_id: number }
  | { nit_ci?: string | null; nombre_razon?: string | null; telefono?: string | null; email?: string | null };

export type PosSalePaymentPayload = {
  metodo?: string | null;
  monto?: number | null;
  referencia_qr?: string | null;
};

export type PosCreateSalePayload = {
  cliente: PosSaleClientPayload;
  items: PosSaleItem[];
  descuento_total?: number | null;
  pago?: PosSalePaymentPayload | null;
};

export type PosSaleDetail = {
  venta_detalle_id: number;
  empresa_id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unit: number;
  descuento: number;
  subtotal: number;
};

export type PosSale = {
  venta_id: number;
  empresa_id: number;
  cliente_id: number;
  fecha_hora: string | null;
  total: number;
  descuento_total: number;
  estado: string;
  pago_metodo: string | null;
  pago_monto: number | null;
  pago_referencia_qr: string | null;
  pago_estado: string | null;
  pagado_en: string | null;
};

export type PosCreateSaleResponse = {
  venta: PosSale;
  cliente: PosClient;
  detalle: PosSaleDetail[];
};

@Injectable({ providedIn: 'root' })
export class TenantPosApi {
  public constructor(private readonly _api: ApiClientService) {}

  public listCategories(empresa_id: number): Observable<PosCategory[]> {
    return this._api.get<PosCategory[]>(`/shop/${empresa_id}/categories`);
  }

  public listProducts(
    empresa_id: number,
    opts?: { q?: string; categoriaId?: number | null; page?: number; pageSize?: number }
  ): Observable<PosProductsResponse> {
    return this._api
      .get<PosProductsResponse>(`/shop/${empresa_id}/products`, {
        query: {
          q: opts?.q,
          categoria_id: opts?.categoriaId ?? undefined,
          page: opts?.page ?? undefined,
          page_size: opts?.pageSize ?? undefined
        }
      })
      .pipe(
        map((res) => {
          const items = (res?.items || []).map((p) => ({
            ...p,
            cantidad_actual: Number((p as any)?.cantidad_actual ?? 0),
            precio: Number((p as any)?.precio ?? 0)
          }));
          return {
            items,
            page: Number(res?.page ?? 1),
            page_size: Number(res?.page_size ?? (opts?.pageSize ?? 20)),
            total: Number(res?.total ?? items.length)
          };
        })
      );
  }

  public lookupClient(empresa_id: number, nit_ci: string): Observable<PosLookupClientResponse> {
    return this._api.get<PosLookupClientResponse>(`/tenant/pos/${empresa_id}/clients/lookup`, {
      query: { nit_ci: String(nit_ci || '').trim() }
    });
  }

  public createClient(empresa_id: number, payload: PosCreateClientPayload): Observable<PosClient> {
    return this._api.post<PosClient>(`/tenant/pos/${empresa_id}/clients`, payload);
  }

  public createSale(empresa_id: number, payload: PosCreateSalePayload): Observable<PosCreateSaleResponse> {
    return this._api.post<PosCreateSaleResponse>(`/tenant/pos/${empresa_id}/sales`, payload);
  }

  public downloadReceipt(ventaId: number): Observable<Blob> {
    return this._api.getBlob(`/tenant/pos/sales/${encodeURIComponent(String(ventaId))}/receipt.pdf`);
  }
}

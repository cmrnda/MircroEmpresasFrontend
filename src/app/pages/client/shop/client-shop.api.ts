import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PublicCategory = {
  categoria_id: number;
  empresa_id: number;
  nombre: string;
};

export type ShopProduct = {
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

export type PublicProductsResponse = {
  items: ShopProduct[];
  page: number;
  page_size: number;
  total: number;
};

export type CreateOrderItem = {
  producto_id: number;
  cantidad: number;
  precio_unit?: number | null;
  descuento?: number | null;
};

export type CreateOrderPayload = {
  items: CreateOrderItem[];
  descuento_total?: number | null;
  envio_departamento?: string | null;
  envio_ciudad?: string | null;
  envio_zona_barrio?: string | null;
  envio_direccion_linea?: string | null;
  envio_referencia?: string | null;
  envio_telefono_receptor?: string | null;
  envio_costo?: number | null;
};

export type ShopOrderDetail = {
  venta_detalle_id: number;
  empresa_id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unit: number;
  descuento: number;
  subtotal: number;
};

export type ShopOrder = {
  venta_id: number;
  empresa_id: number;
  cliente_id: number;
  fecha_hora: string | null;
  total: number;
  descuento_total: number;
  estado: string;

  envio_departamento: string | null;
  envio_ciudad: string | null;
  envio_zona_barrio: string | null;
  envio_direccion_linea: string | null;
  envio_referencia: string | null;
  envio_telefono_receptor: string | null;
  envio_costo: number;
  envio_estado: string | null;

  detalle?: ShopOrderDetail[];
};

export type MyOrdersResponse = {
  items: ShopOrder[];
};

@Injectable({ providedIn: 'root' })
export class ClientShopApi {
  public constructor(private readonly _api: ApiClientService) {}

  public listCategories(empresa_id: number): Observable<PublicCategory[]> {
    return this._api.get<PublicCategory[]>(`/shop/${empresa_id}/categories`);
  }

  public listProducts(
    empresa_id: number,
    opts?: { q?: string; categoriaId?: number | null; page?: number; pageSize?: number }
  ): Observable<PublicProductsResponse> {
    const params: string[] = [];

    if (opts?.q) params.push(`q=${encodeURIComponent(opts.q)}`);
    if (opts?.categoriaId != null) params.push(`categoria_id=${encodeURIComponent(String(opts.categoriaId))}`);
    if (opts?.page != null) params.push(`page=${encodeURIComponent(String(opts.page))}`);
    if (opts?.pageSize != null) params.push(`page_size=${encodeURIComponent(String(opts.pageSize))}`);

    const qs = params.length ? `?${params.join('&')}` : '';

    return this._api.get<PublicProductsResponse>(`/shop/${empresa_id}/products${qs}`).pipe(
      map((res) => {
        const items = (res?.items || []).filter((p) => (p?.cantidad_actual ?? 0) > 0);
        return {
          items,
          page: Number(res?.page ?? 1),
          page_size: Number(res?.page_size ?? (opts?.pageSize ?? 20)),
          total: Number(res?.total ?? items.length)
        };
      })
    );
  }

  public getProduct(empresa_id: number, producto_id: number): Observable<ShopProduct> {
    return this._api.get<ShopProduct>(`/shop/${empresa_id}/products/${producto_id}`);
  }

  public createOrder(empresa_id: number, payload: CreateOrderPayload): Observable<ShopOrder> {
    return this._api.post<ShopOrder>(`/shop/${empresa_id}/orders`, payload);
  }

  public listMyOrders(empresa_id: number): Observable<MyOrdersResponse> {
    return this._api.get<MyOrdersResponse>(`/shop/${empresa_id}/my/orders`);
  }

  public getMyOrder(empresa_id: number, venta_id: number): Observable<ShopOrder> {
    return this._api.get<ShopOrder>(`/shop/${empresa_id}/my/orders/${venta_id}`);
  }
}

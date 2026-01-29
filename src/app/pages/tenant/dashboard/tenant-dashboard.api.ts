import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type DashboardSeriesPoint = { periodo: string; total: number };

export type TenantDashboardOverview = {
  revenue_total: number;
  expenses_total: number;
  profit_total: number;
  profit_margin_pct: number;
  sales_count: number;
  purchases_count: number;
  avg_sale_total: number;
  avg_purchase_total: number;
  products_count: number;
  categories_count: number;
  suppliers_count: number;
  clients_count: number;
  low_stock_count: number;
};

export type DashboardSupplier = {
  proveedor_id: number;
  proveedor_nombre: string | null;
  compras_total: number;
  n_compras: number;
  ultima_compra_fecha: string | null;
};

export type DashboardTopProduct = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  qty: number;
  total: number;
};

export type DashboardTopCategory = {
  categoria_id: number;
  categoria_nombre: string;
  total: number;
};

export type DashboardInvAlert = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  categoria_nombre: string | null;
  stock: number;
  stock_min: number;
};

export type DashboardInvValuation = {
  inventory_price_value: number;
  inventory_avg_cost_value: number;
};

export type TenantDashboardResponse = {
  empresa_id: number;
  from: string | null;
  to: string | null;
  group: 'day' | 'month';
  overview: TenantDashboardOverview;
  series: {
    revenue: DashboardSeriesPoint[];
    expenses: DashboardSeriesPoint[];
  };
  suppliers: { items: DashboardSupplier[] };
  top_products: { items: DashboardTopProduct[] };
  top_categories: { items: DashboardTopCategory[] };
  inventory: {
    valuation: DashboardInvValuation;
    alerts: { items: DashboardInvAlert[] };
  };
  recent: {
    sales: { items: any[] };
    purchases: { items: any[] };
  };
};

export type SaleDetailResponse = {
  empresa_id: number;
  venta: any;
  items: Array<{
    venta_detalle_id: number;
    producto_id: number;
    producto_codigo?: string | null;
    producto_descripcion?: string | null;
    cantidad: number;
    precio_unit: number;
    descuento: number;
    subtotal: number;
  }>;
};

export type PurchaseDetailResponse = {
  empresa_id: number;
  compra: any;
  items: Array<{
    compra_detalle_id: number;
    producto_id: number;
    cantidad: number;
    costo_unit: number;
    subtotal: number;
    lote?: string | null;
    fecha_vencimiento?: string | null;
  }>;
};

@Injectable({ providedIn: 'root' })
export class TenantDashboardApi {
  public constructor(private readonly _api: ApiClientService) {}

  public getDashboard(opts?: { from?: string; to?: string; group?: 'day' | 'month'; limit?: number }): Observable<TenantDashboardResponse> {
    return this._api.get<TenantDashboardResponse>('/tenant/dashboard', {
      query: {
        from: opts?.from,
        to: opts?.to,
        group: opts?.group,
        limit: opts?.limit
      }
    });
  }

  public saleDetail(ventaId: number): Observable<SaleDetailResponse> {
    return this._api.get<SaleDetailResponse>(`/tenant/dashboard/sales/${ventaId}`);
  }

  public purchaseDetail(compraId: number): Observable<PurchaseDetailResponse> {
    return this._api.get<PurchaseDetailResponse>(`/tenant/dashboard/purchases/${compraId}`);
  }
}

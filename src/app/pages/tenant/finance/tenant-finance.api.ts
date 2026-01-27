import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type FinanceOverview = {
  empresa_id: number;
  from?: string | null;
  to?: string | null;
  expenses_total: number;
  revenue_total: number;
  profit_total: number;
  profit_margin_pct: number;
  purchases_count: number;
  sales_count: number;
  avg_purchase_total: number;
  avg_sale_total: number;
};

export type CashflowSeriesItem = {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export type CashflowSeriesResponse = {
  empresa_id: number;
  from?: string | null;
  to?: string | null;
  group: 'day' | 'month';
  items: CashflowSeriesItem[];
};

export type SupplierSummaryItem = {
  proveedor_id: number;
  proveedor_nombre: string | null;
  compras_total: number;
  n_compras: number;
  ultima_compra_fecha: string | null;
  ultima_compra_total: number;
};

export type SuppliersSummaryResponse = {
  empresa_id: number;
  from?: string | null;
  to?: string | null;
  limit: number;
  offset: number;
  items: SupplierSummaryItem[];
};

export type TopProductItem = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  qty: number;
  total: number;
};

export type TopProductsResponse = {
  empresa_id: number;
  from?: string | null;
  to?: string | null;
  limit: number;
  offset: number;
  items: TopProductItem[];
};

export type TopCategoryItem = {
  categoria_id: number;
  categoria_nombre: string;
  total: number;
};

export type TopCategoriesResponse = {
  empresa_id: number;
  from?: string | null;
  to?: string | null;
  limit: number;
  offset: number;
  items: TopCategoryItem[];
};

export type InventoryAlertItem = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  stock: number;
  stock_min: number;
  categoria_nombre: string | null;
};

export type InventoryAlertsResponse = {
  empresa_id: number;
  limit: number;
  offset: number;
  items: InventoryAlertItem[];
};

export type InventoryValuation = {
  empresa_id: number;
  inventory_price_value: number;
  inventory_avg_cost_value: number;
};

export type PurchaseListItem = {
  compra_id: number;
  empresa_id: number;
  proveedor_id: number | null;
  fecha_hora: string;
  total: number;
  estado: 'CREADA' | 'RECIBIDA' | 'ANULADA' | string;
  observacion?: string | null;
  proveedor_nombre?: string | null;
};

export type PurchasesListResponse = {
  empresa_id: number;
  proveedor_id: number | null;
  estado: string | null;
  from?: string | null;
  to?: string | null;
  limit: number;
  offset: number;
  items: PurchaseListItem[];
};

export type PurchaseDetailItem = {
  compra_detalle_id: number;
  empresa_id: number;
  compra_id: number;
  producto_id: number;
  cantidad: number;
  costo_unit: number;
  subtotal: number;
  lote?: string | null;
  fecha_vencimiento?: string | null;
};

export type PurchaseDetailResponse = {
  empresa_id: number;
  compra: PurchaseListItem & { proveedor_nombre?: string | null };
  items: PurchaseDetailItem[];
};

export type SaleListItem = {
  venta_id: number;
  empresa_id: number;
  cliente_id: number | null;
  fecha_hora: string;
  total: number;
  descuento_total: number;
  estado: string;
  pago_metodo?: string | null;
  pago_monto?: number | null;
  pago_estado?: string | null;
  cliente_nombre?: string | null;
};

export type SalesListResponse = {
  empresa_id: number;
  cliente_id: number | null;
  estado: string | null;
  from?: string | null;
  to?: string | null;
  limit: number;
  offset: number;
  items: SaleListItem[];
};

export type SaleDetailItem = {
  venta_detalle_id: number;
  empresa_id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unit: number;
  descuento: number;
  subtotal: number;
  producto_codigo?: string | null;
  producto_descripcion?: string | null;
};

export type SaleDetailResponse = {
  empresa_id: number;
  venta: SaleListItem;
  items: SaleDetailItem[];
};

@Injectable({ providedIn: 'root' })
export class TenantFinanceApi {
  public constructor(private readonly _api: ApiClientService) {}

  private qs(params: Record<string, string | number | null | undefined>): string {
    const parts: string[] = [];
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      const s = String(v).trim();
      if (!s) continue;
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(s)}`);
    }
    return parts.length ? `?${parts.join('&')}` : '';
  }

  public overview(opts?: { from?: string; to?: string }): Observable<FinanceOverview> {
    const q = this.qs({ from: opts?.from, to: opts?.to });
    return this._api.get<FinanceOverview>(`/tenant/finance/overview${q}`);
  }

  public cashflowSeries(opts: { from?: string; to?: string; group?: 'day' | 'month' }): Observable<CashflowSeriesResponse> {
    const q = this.qs({ from: opts.from, to: opts.to, group: opts.group ?? 'day' });
    return this._api.get<CashflowSeriesResponse>(`/tenant/finance/cashflow-series${q}`);
  }

  public suppliersSummary(opts: { from?: string; to?: string; limit?: number; offset?: number }): Observable<SuppliersSummaryResponse> {
    const q = this.qs({ from: opts.from, to: opts.to, limit: opts.limit ?? 10, offset: opts.offset ?? 0 });
    return this._api.get<SuppliersSummaryResponse>(`/tenant/finance/suppliers-summary${q}`);
  }

  public topProducts(opts: { from?: string; to?: string; limit?: number; offset?: number }): Observable<TopProductsResponse> {
    const q = this.qs({ from: opts.from, to: opts.to, limit: opts.limit ?? 10, offset: opts.offset ?? 0 });
    return this._api.get<TopProductsResponse>(`/tenant/finance/top-products${q}`);
  }

  public topCategories(opts: { from?: string; to?: string; limit?: number; offset?: number }): Observable<TopCategoriesResponse> {
    const q = this.qs({ from: opts.from, to: opts.to, limit: opts.limit ?? 10, offset: opts.offset ?? 0 });
    return this._api.get<TopCategoriesResponse>(`/tenant/finance/top-categories${q}`);
  }

  public inventoryAlerts(opts?: { limit?: number; offset?: number }): Observable<InventoryAlertsResponse> {
    const q = this.qs({ limit: opts?.limit ?? 20, offset: opts?.offset ?? 0 });
    return this._api.get<InventoryAlertsResponse>(`/tenant/finance/inventory-alerts${q}`);
  }

  public inventoryValuation(): Observable<InventoryValuation> {
    return this._api.get<InventoryValuation>(`/tenant/finance/inventory-valuation`);
  }

  public purchases(opts: { proveedor_id?: number | null; estado?: string | null; from?: string; to?: string; limit?: number; offset?: number }): Observable<PurchasesListResponse> {
    const q = this.qs({
      proveedor_id: opts.proveedor_id ?? null,
      estado: opts.estado ?? null,
      from: opts.from,
      to: opts.to,
      limit: opts.limit ?? 20,
      offset: opts.offset ?? 0
    });
    return this._api.get<PurchasesListResponse>(`/tenant/finance/purchases${q}`);
  }

  public purchaseDetail(compra_id: number): Observable<PurchaseDetailResponse> {
    return this._api.get<PurchaseDetailResponse>(`/tenant/finance/purchases/${encodeURIComponent(String(compra_id))}`);
  }

  public sales(opts: { cliente_id?: number | null; estado?: string | null; from?: string; to?: string; limit?: number; offset?: number }): Observable<SalesListResponse> {
    const q = this.qs({
      cliente_id: opts.cliente_id ?? null,
      estado: opts.estado ?? null,
      from: opts.from,
      to: opts.to,
      limit: opts.limit ?? 20,
      offset: opts.offset ?? 0
    });
    return this._api.get<SalesListResponse>(`/tenant/finance/sales${q}`);
  }

  public saleDetail(venta_id: number): Observable<SaleDetailResponse> {
    return this._api.get<SaleDetailResponse>(`/tenant/finance/sales/${encodeURIComponent(String(venta_id))}`);
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TenantFinanceApi,
  FinanceOverview,
  CashflowSeriesResponse,
  SuppliersSummaryResponse,
  TopProductsResponse,
  TopCategoriesResponse,
  InventoryAlertsResponse,
  InventoryValuation,
  PurchasesListResponse,
  PurchaseDetailResponse,
  SalesListResponse,
  SaleDetailResponse,
  PurchaseListItem,
  SaleListItem
} from './tenant-finance.api';

type TabKey = 'dashboard' | 'transactions' | 'inventory';
type TxTabKey = 'purchases' | 'sales';

@Component({
  standalone: true,
  selector: 'app-tenant-finance-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-finance.page.html'
})
export class TenantFinancePage {
  private readonly _api = inject(TenantFinanceApi);

  public readonly tab = signal<TabKey>('dashboard');
  public readonly txTab = signal<TxTabKey>('purchases');

  public readonly from = signal<string>('');
  public readonly to = signal<string>('');
  public readonly group = signal<'day' | 'month'>('day');

  public readonly loading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  public readonly overview = signal<FinanceOverview | null>(null);
  public readonly cashflow = signal<CashflowSeriesResponse | null>(null);
  public readonly suppliers = signal<SuppliersSummaryResponse | null>(null);
  public readonly topProducts = signal<TopProductsResponse | null>(null);
  public readonly topCategories = signal<TopCategoriesResponse | null>(null);
  public readonly invAlerts = signal<InventoryAlertsResponse | null>(null);
  public readonly invVal = signal<InventoryValuation | null>(null);

  public readonly purchasesLoading = signal<boolean>(false);
  public readonly purchasesError = signal<string | null>(null);
  public readonly purchases = signal<PurchasesListResponse | null>(null);
  public readonly purchasesLimit = signal<number>(20);
  public readonly purchasesOffset = signal<number>(0);
  public readonly purchasesEstado = signal<string>('');
  public readonly purchasesProveedorId = signal<number | null>(null);

  public readonly salesLoading = signal<boolean>(false);
  public readonly salesError = signal<string | null>(null);
  public readonly sales = signal<SalesListResponse | null>(null);
  public readonly salesLimit = signal<number>(20);
  public readonly salesOffset = signal<number>(0);
  public readonly salesEstado = signal<string>('');
  public readonly salesClienteId = signal<number | null>(null);

  public readonly purchaseModalOpen = signal<boolean>(false);
  public readonly purchaseDetailLoading = signal<boolean>(false);
  public readonly purchaseDetailError = signal<string | null>(null);
  public readonly purchaseDetail = signal<PurchaseDetailResponse | null>(null);

  public readonly saleModalOpen = signal<boolean>(false);
  public readonly saleDetailLoading = signal<boolean>(false);
  public readonly saleDetailError = signal<string | null>(null);
  public readonly saleDetail = signal<SaleDetailResponse | null>(null);

  public readonly kpiProfitColor = computed(() => {
    const p = Number(this.overview()?.profit_total ?? 0);
    if (p > 0) return 'text-emerald-700';
    if (p < 0) return 'text-rose-700';
    return 'text-slate-900';
  });

  public readonly cashflowChart = computed(() => {
    const items = this.cashflow()?.items ?? [];
    const w = 320;
    const h = 90;
    const padX = 8;
    const padY = 10;

    const n = items.length;
    if (!n) return { w, h, bars: [] as Array<{ x: number; y1: number; y2: number; bw: number; h1: number; h2: number; label: string }> };

    const maxV = Math.max(
      1,
      ...items.map(i => Math.max(Number(i.revenue || 0), Number(i.expenses || 0)))
    );

    const gap = 6;
    const groupW = Math.max(14, Math.floor((w - padX * 2 - gap * (n - 1)) / n));
    const barW = Math.max(6, Math.floor((groupW - 4) / 2));
    const usableH = h - padY * 2;

    const bars = items.map((it, idx) => {
      const rev = Number(it.revenue || 0);
      const exp = Number(it.expenses || 0);

      const h1 = Math.max(1, Math.round((rev / maxV) * usableH));
      const h2 = Math.max(1, Math.round((exp / maxV) * usableH));

      const x = padX + idx * (groupW + gap);
      const y1 = h - padY - h1;
      const y2 = h - padY - h2;

      return { x, y1, y2, bw: barW, h1, h2, label: it.period };
    });

    return { w, h, bars };
  });

  public constructor() {
    this.loadDashboard();
    effect(() => {
      if (this.tab() === 'transactions') {
        if (this.txTab() === 'purchases' && !this.purchases()) this.loadPurchases();
        if (this.txTab() === 'sales' && !this.sales()) this.loadSales();
      }
      if (this.tab() === 'inventory') {
        if (!this.invVal()) this.loadInventory();
      }
    });
  }

  public loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    const from = (this.from() || '').trim() || undefined;
    const to = (this.to() || '').trim() || undefined;
    const group = this.group();

    let doneN = 0;
    const done = () => {
      doneN += 1;
      if (doneN >= 6) this.loading.set(false);
    };

    this._api.overview({ from, to }).subscribe({
      next: res => { this.overview.set(res); done(); },
      error: err => { this.overview.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });

    this._api.cashflowSeries({ from, to, group }).subscribe({
      next: res => { this.cashflow.set(res); done(); },
      error: err => { this.cashflow.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });

    this._api.suppliersSummary({ from, to, limit: 10, offset: 0 }).subscribe({
      next: res => { this.suppliers.set(res); done(); },
      error: err => { this.suppliers.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });

    this._api.topProducts({ from, to, limit: 10, offset: 0 }).subscribe({
      next: res => { this.topProducts.set(res); done(); },
      error: err => { this.topProducts.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });

    this._api.topCategories({ from, to, limit: 8, offset: 0 }).subscribe({
      next: res => { this.topCategories.set(res); done(); },
      error: err => { this.topCategories.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });

    this._api.inventoryAlerts({ limit: 10, offset: 0 }).subscribe({
      next: res => { this.invAlerts.set(res); done(); },
      error: err => { this.invAlerts.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });
  }

  public loadInventory(): void {
    this.loading.set(true);
    this.error.set(null);

    let doneN = 0;
    const done = () => {
      doneN += 1;
      if (doneN >= 2) this.loading.set(false);
    };

    this._api.inventoryValuation().subscribe({
      next: res => { this.invVal.set(res); done(); },
      error: err => { this.invVal.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });

    this._api.inventoryAlerts({ limit: 50, offset: 0 }).subscribe({
      next: res => { this.invAlerts.set(res); done(); },
      error: err => { this.invAlerts.set(null); this.error.set(err?.error?.error ?? 'load_failed'); done(); }
    });
  }

  public loadPurchases(): void {
    this.purchasesLoading.set(true);
    this.purchasesError.set(null);

    const from = (this.from() || '').trim() || undefined;
    const to = (this.to() || '').trim() || undefined;

    const estado = (this.purchasesEstado() || '').trim().toUpperCase() || null;
    const proveedor_id = this.purchasesProveedorId();

    this._api.purchases({
      from,
      to,
      estado,
      proveedor_id,
      limit: this.purchasesLimit(),
      offset: this.purchasesOffset()
    }).subscribe({
      next: res => { this.purchases.set(res); this.purchasesLoading.set(false); },
      error: err => { this.purchases.set(null); this.purchasesError.set(err?.error?.error ?? 'load_failed'); this.purchasesLoading.set(false); }
    });
  }

  public loadSales(): void {
    this.salesLoading.set(true);
    this.salesError.set(null);

    const from = (this.from() || '').trim() || undefined;
    const to = (this.to() || '').trim() || undefined;

    const estado = (this.salesEstado() || '').trim().toUpperCase() || null;
    const cliente_id = this.salesClienteId();

    this._api.sales({
      from,
      to,
      estado,
      cliente_id,
      limit: this.salesLimit(),
      offset: this.salesOffset()
    }).subscribe({
      next: res => { this.sales.set(res); this.salesLoading.set(false); },
      error: err => { this.sales.set(null); this.salesError.set(err?.error?.error ?? 'load_failed'); this.salesLoading.set(false); }
    });
  }

  public openPurchaseDetail(row: PurchaseListItem): void {
    this.purchaseModalOpen.set(true);
    this.purchaseDetailLoading.set(true);
    this.purchaseDetailError.set(null);
    this.purchaseDetail.set(null);

    this._api.purchaseDetail(Number(row.compra_id)).subscribe({
      next: res => { this.purchaseDetail.set(res); this.purchaseDetailLoading.set(false); },
      error: err => { this.purchaseDetail.set(null); this.purchaseDetailError.set(err?.error?.error ?? 'load_failed'); this.purchaseDetailLoading.set(false); }
    });
  }

  public closePurchaseDetail(): void {
    this.purchaseModalOpen.set(false);
    this.purchaseDetailLoading.set(false);
    this.purchaseDetailError.set(null);
    this.purchaseDetail.set(null);
  }

  public openSaleDetail(row: SaleListItem): void {
    this.saleModalOpen.set(true);
    this.saleDetailLoading.set(true);
    this.saleDetailError.set(null);
    this.saleDetail.set(null);

    this._api.saleDetail(Number(row.venta_id)).subscribe({
      next: res => { this.saleDetail.set(res); this.saleDetailLoading.set(false); },
      error: err => { this.saleDetail.set(null); this.saleDetailError.set(err?.error?.error ?? 'load_failed'); this.saleDetailLoading.set(false); }
    });
  }

  public closeSaleDetail(): void {
    this.saleModalOpen.set(false);
    this.saleDetailLoading.set(false);
    this.saleDetailError.set(null);
    this.saleDetail.set(null);
  }

  public fmtMoney(n: number | null | undefined): string {
    const x = Number(n || 0);
    return new Intl.NumberFormat('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(x);
  }

  public fmtDate(s: string | null | undefined): string {
    if (!s) return '-';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(s);
    return d.toLocaleString('es-BO');
  }

  public chipClass(s: string | null | undefined): string {
    const x = String(s || '').toUpperCase();
    if (x === 'RECIBIDA') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (x === 'ANULADA') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantDashboardApi, TenantDashboardResponse, PurchaseDetailResponse, SaleDetailResponse } from './tenant-dashboard.api';

type TabKey = 'resumen' | 'movimientos' | 'inventario';

@Component({
  standalone: true,
  selector: 'app-tenant-dashboard-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-dashboard.page.html'
})
export class TenantDashboardPage {
  private readonly _api = inject(TenantDashboardApi);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly data = signal<TenantDashboardResponse | null>(null);

  public readonly from = signal<string>('');
  public readonly to = signal<string>('');
  public readonly group = signal<'day' | 'month'>('day');
  public readonly limit = signal<number>(10);

  public readonly tab = signal<TabKey>('resumen');
  public readonly entered = signal(false);

  public readonly saleModalOpen = signal(false);
  public readonly purchaseModalOpen = signal(false);

  public readonly saleDetailLoading = signal(false);
  public readonly saleDetailError = signal<string | null>(null);
  public readonly saleDetail = signal<SaleDetailResponse | null>(null);

  public readonly purchaseDetailLoading = signal(false);
  public readonly purchaseDetailError = signal<string | null>(null);
  public readonly purchaseDetail = signal<PurchaseDetailResponse | null>(null);

  public constructor() {
    this.loadDashboard();
    setTimeout(() => this.entered.set(true), 0);
  }

  public loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.getDashboard({
      from: (this.from() || '').trim() || undefined,
      to: (this.to() || '').trim() || undefined,
      group: this.group(),
      limit: this.limit()
    }).subscribe({
      next: res => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.data.set(null);
        this.loading.set(false);
      }
    });
  }

  public fmtMoney(n: number): string {
    const x = Number(n || 0);
    try {
      return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 2 }).format(x);
    } catch {
      return String(x.toFixed(2));
    }
  }

  public fmtDate(s: string | null | undefined): string {
    if (!s) return '-';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(s);
    return new Intl.DateTimeFormat('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  }

  public kpiProfitColor(): string {
    const p = Number(this.data()?.overview?.profit_total ?? 0);
    return p >= 0 ? 'text-emerald-700' : 'text-rose-700';
  }

  public cashflowChart = computed(() => {
    const revenue = this.data()?.series?.revenue ?? [];
    const expenses = this.data()?.series?.expenses ?? [];

    const mapR = new Map<string, number>();
    const mapE = new Map<string, number>();
    for (const it of revenue) mapR.set(it.periodo, Number(it.total || 0));
    for (const it of expenses) mapE.set(it.periodo, Number(it.total || 0));

    const keys = Array.from(new Set([...mapR.keys(), ...mapE.keys()])).sort();
    const values = keys.map(k => Math.max(mapR.get(k) || 0, mapE.get(k) || 0));
    const maxV = Math.max(1, ...values);

    const h = 110;
    const pad = 8;
    const bw = 10;
    const gap = 14;

    const w = Math.max(360, keys.length * (bw * 2 + gap) + pad * 2);

    const bars = keys.map((k, i) => {
      const rv = mapR.get(k) || 0;
      const ev = mapE.get(k) || 0;

      const x = pad + i * (bw * 2 + gap);
      const y0 = h - pad;

      const rh = Math.max(0, (rv / maxV) * (h - pad * 2));
      const eh = Math.max(0, (ev / maxV) * (h - pad * 2));

      return {
        key: k,
        x,
        bw,
        y1: y0 - rh,
        h1: rh,
        y2: y0 - eh,
        h2: eh
      };
    });

    return { w, h, bars, keys };
  });

  public openSaleDetail(row: any): void {
    const ventaId = Number(row?.venta_id ?? 0);
    if (!Number.isFinite(ventaId) || ventaId <= 0) return;

    this.saleDetail.set(null);
    this.saleDetailError.set(null);
    this.saleDetailLoading.set(true);
    this.saleModalOpen.set(true);

    this._api.saleDetail(ventaId).subscribe({
      next: res => {
        this.saleDetail.set(res);
        this.saleDetailLoading.set(false);
      },
      error: err => {
        this.saleDetailError.set(err?.error?.error ?? 'load_failed');
        this.saleDetailLoading.set(false);
      }
    });
  }

  public closeSaleDetail(): void {
    this.saleModalOpen.set(false);
  }

  public openPurchaseDetail(row: any): void {
    const compraId = Number(row?.compra_id ?? 0);
    if (!Number.isFinite(compraId) || compraId <= 0) return;

    this.purchaseDetail.set(null);
    this.purchaseDetailError.set(null);
    this.purchaseDetailLoading.set(true);
    this.purchaseModalOpen.set(true);

    this._api.purchaseDetail(compraId).subscribe({
      next: res => {
        this.purchaseDetail.set(res);
        this.purchaseDetailLoading.set(false);
      },
      error: err => {
        this.purchaseDetailError.set(err?.error?.error ?? 'load_failed');
        this.purchaseDetailLoading.set(false);
      }
    });
  }

  public closePurchaseDetail(): void {
    this.purchaseModalOpen.set(false);
  }

  public hostAnimClass(): string {
    return this.entered() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2';
  }

  public trackById(_: number, x: any): any {
    return x?.id ?? x?.venta_id ?? x?.compra_id ?? x?.producto_id ?? x?.categoria_id ?? x?.proveedor_id ?? _;
  }
}

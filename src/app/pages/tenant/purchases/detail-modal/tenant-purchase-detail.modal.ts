import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { TenantPurchase, TenantPurchasesApi } from '../tenant-purchases.api';
import { TenantProductsApi, TenantProduct } from '../../products/tenant-products.api';

@Component({
  standalone: true,
  selector: 'app-tenant-purchase-detail-modal',
  imports: [CommonModule],
  templateUrl: './tenant-purchase-detail.modal.html'
})
export class TenantPurchaseDetailModalComponent {
  private readonly _api = inject(TenantPurchasesApi);
  private readonly _prodApi = inject(TenantProductsApi);

  @Input({ required: true }) public compraId!: number;
  @Input() public products: TenantProduct[] = [];

  @Output() public closed = new EventEmitter<void>();

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly data = signal<TenantPurchase | null>(null);

  public ngOnInit(): void {
    this.load();
  }

  public close(): void {
    this.closed.emit();
  }

  public load(): void {
    const id = Number(this.compraId);
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    const ensureProducts = this.products?.length
      ? Promise.resolve(this.products)
      : new Promise<TenantProduct[]>((resolve) => {
        this._prodApi.list({ includeInactivos: true }).subscribe({
          next: (res) => resolve(res?.items ?? []),
          error: () => resolve([])
        });
      });

    ensureProducts.then((prods) => {
      this.products = prods ?? [];

      this._api.get(id).subscribe({
        next: (res) => this.data.set(res),
        error: (err) => this.error.set(err?.error?.error ?? 'load_failed'),
        complete: () => this.loading.set(false)
      });
    });
  }

  public downloadPdf(): void {
    const id = Number(this.compraId);
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this._api.downloadPdf(id).subscribe({
      next: (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `purchase_${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.error.set(err?.error?.error ?? 'pdf_failed'),
      complete: () => this.loading.set(false)
    });
  }

  public supplierLabel(c: TenantPurchase): string {
    const name = String(c?.proveedor?.nombre ?? '').trim();
    if (name) return name;
    const id = Number(c?.proveedor_id ?? 0);
    return id ? `#${id}` : '-';
  }

  public productLabelFromDetail(d: any): string {
    const prod = d?.producto ?? null;
    if (prod) {
      const code = String(prod.codigo ?? '').trim();
      const desc = String(prod.descripcion ?? '').trim();
      if (code && desc) return `${code} - ${desc}`;
      return desc || code || `#${Number(d?.producto_id ?? 0)}`;
    }

    const pid = Number(d?.producto_id ?? 0);
    const p = (this.products ?? []).find(x => Number(x.producto_id) === pid);
    if (!p) return `#${pid}`;
    const code = String(p.codigo ?? '').trim();
    const desc = String(p.descripcion ?? '').trim();
    if (code && desc) return `${code} - ${desc}`;
    return desc || code || `#${pid}`;
  }

  public fmt2(n: unknown): string {
    const x = Number(n ?? 0);
    if (!Number.isFinite(x)) return '0.00';
    return x.toFixed(2);
  }

  public fmt3(n: unknown): string {
    const x = Number(n ?? 0);
    if (!Number.isFinite(x)) return '0.000';
    return x.toFixed(3);
  }
}

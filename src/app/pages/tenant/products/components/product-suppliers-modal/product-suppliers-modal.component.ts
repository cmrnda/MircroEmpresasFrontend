import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ApiClientService } from '../../../../../core/http/api-client.service';
import { TenantSupplier } from '../../../suppliers/tenant-suppliers.api';

export type ProductLike = {
  producto_id: number;
  codigo?: string | null;
  descripcion?: string | null;
};

type ListSuppliersResp = { items: TenantSupplier[] };
type ListProductSuppliersResp = { items: TenantSupplier[] };
type PutProductSuppliersResp = { ok: boolean; proveedor_ids?: number[]; items?: TenantSupplier[]; missing?: number[] };

@Component({
  standalone: true,
  selector: 'app-product-suppliers-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-suppliers-modal.component.html'
})
export class ProductSuppliersModalComponent implements OnChanges {
  private readonly _api = inject(ApiClientService);

  @Input({ required: true }) public open = false;
  @Input() public product: ProductLike | null = null;

  @Output() public closed = new EventEmitter<void>();
  @Output() public saved = new EventEmitter<{ producto_id: number; proveedor_ids: number[] }>();

  public loading = false;
  public saving = false;
  public error: string | null = null;

  public q = '';
  public suppliers: TenantSupplier[] = [];
  public selected = new Set<number>();

  public ngOnChanges(changes: SimpleChanges): void {
    const openedNow = !!changes['open']?.currentValue && !changes['open']?.previousValue;
    const productChanged = !!changes['product'] && this.open;

    if (openedNow || productChanged) this.load();

    if (changes['open'] && !this.open) {
      this.resetLocal();
    }
  }

  private resetLocal(): void {
    this.q = '';
    this.suppliers = [];
    this.selected = new Set<number>();
    this.loading = false;
    this.saving = false;
    this.error = null;
  }

  public close(): void {
    this.closed.emit();
  }

  public isChecked(id: number): boolean {
    return this.selected.has(Number(id));
  }

  public toggle(id: number, checked: boolean): void {
    const n = Number(id);
    if (!Number.isFinite(n)) return;
    if (checked) this.selected.add(n);
    else this.selected.delete(n);
  }

  public get filteredSuppliers(): TenantSupplier[] {
    const qq = String(this.q || '').trim().toLowerCase();
    if (!qq) return this.suppliers;

    return this.suppliers.filter(s => {
      const a = String(s.nombre || '').toLowerCase();
      const b = String(s.nit || '').toLowerCase();
      return a.includes(qq) || b.includes(qq);
    });
  }

  public get selectedCount(): number {
    return this.selected.size;
  }

  private load(): void {
    if (!this.open) return;
    if (!this.product?.producto_id) return;

    const pid = Number(this.product.producto_id);
    this.loading = true;
    this.error = null;
    this.selected = new Set<number>();

    const all$ = this._api.get<ListSuppliersResp>('/tenant/suppliers', { query: { include_inactivos: false } });
    const selected$ = this._api.get<ListProductSuppliersResp>(`/tenant/products/${encodeURIComponent(String(pid))}/suppliers`, {
      query: { include_inactivos: true }
    });

    forkJoin([all$, selected$]).pipe(
      tap(([allRes, selRes]) => {
        this.suppliers = allRes?.items ?? [];
        const sel = (selRes?.items ?? []).map(x => Number(x.proveedor_id)).filter(n => Number.isFinite(n));
        this.selected = new Set<number>(sel);
      }),
      catchError(err => {
        this.error = err?.error?.error ?? 'load_failed';
        this.suppliers = [];
        this.selected = new Set<number>();
        return of(null);
      }),
      finalize(() => (this.loading = false))
    ).subscribe();
  }

  public save(): void {
    if (!this.product?.producto_id) return;
    if (this.saving) return;

    const pid = Number(this.product.producto_id);
    const proveedor_ids = Array.from(this.selected.values()).sort((a, b) => a - b);

    this.saving = true;
    this.error = null;

    this._api.put<PutProductSuppliersResp>(
      `/tenant/products/${encodeURIComponent(String(pid))}/suppliers`,
      { proveedor_ids }
    ).pipe(
      tap(() => {
        this.saved.emit({ producto_id: pid, proveedor_ids });
        this.close();
      }),
      catchError(err => {
        if (err?.error?.error === 'invalid_suppliers') {
          const missing = err?.error?.missing ?? [];
          this.error = `Proveedores inválidos o inactivos: ${missing.join(', ')}`;
        } else {
          this.error = err?.error?.error ?? 'save_failed';
        }
        return of(null);
      }),
      finalize(() => (this.saving = false))
    ).subscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantPurchasesFacade } from './tenant-purchases.facade';
import { TenantSuppliersApi, TenantSupplier } from '../suppliers/tenant-suppliers.api';
import { TenantProductsApi, TenantProduct } from '../products/tenant-products.api';
import { TenantPurchaseDetailModalComponent } from './detail-modal/tenant-purchase-detail.modal';

type DraftItem = { producto_id: number; descripcion: string; cantidad: number; costo_unit: number; subtotal: number };

@Component({
  standalone: true,
  selector: 'app-tenant-purchases-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TenantPurchaseDetailModalComponent],
  templateUrl: './tenant-purchases.page.html'
})
export class TenantPurchasesPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantPurchasesFacade);
  private readonly _supApi = inject(TenantSuppliersApi);
  private readonly _prodApi = inject(TenantProductsApi);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly suppliers = signal<TenantSupplier[]>([]);
  public readonly products = signal<TenantProduct[]>([]);

  public readonly filterSupplierId = signal<number | null>(null);
  public readonly filterEstado = signal<string | null>(null);

  public readonly draftItems = signal<DraftItem[]>([]);
  public readonly productPickerQ = signal('');

  public readonly detailOpen = signal(false);
  public readonly detailCompraId = signal<number | null>(null);

  public readonly totalDraft = computed(() => {
    const rows = this.draftItems() ?? [];
    return rows.reduce((acc, r) => acc + (Number(r.subtotal) || 0), 0);
  });

  public readonly form = this._fb.group({
    proveedor_id: [null as number | null, [Validators.required]],
    observacion: ['']
  });

  public readonly itemForm = this._fb.group({
    producto_id: [null as number | null, [Validators.required]],
    cantidad: [1 as number | null, [Validators.required]],
    costo_unit: [0 as number | null, [Validators.required]]
  });

  public constructor() {
    this._supApi.list({ includeInactivos: false }).subscribe(res => this.suppliers.set(res.items ?? []));
    this._prodApi.list({ includeInactivos: true }).subscribe(res => this.products.set(res.items ?? []));
    this.reload();
  }

  public openDetail(compraId: number): void {
    this.detailCompraId.set(Number(compraId));
    this.detailOpen.set(true);
  }

  public closeDetail(): void {
    this.detailOpen.set(false);
    this.detailCompraId.set(null);
  }

  public reload(): void {
    this._facade.load({
      proveedorId: this.filterSupplierId() ?? undefined,
      estado: this.filterEstado() ?? undefined
    }).subscribe();
  }

  public addItem(): void {
    if (this.itemForm.invalid) return;
    const v = this.itemForm.value;

    const pid = Number(v.producto_id);
    const cantidad = this._toNumberOrZero(v.cantidad);
    const costo = this._toNumberOrZero(v.costo_unit);
    if (!pid || cantidad <= 0) return;

    const p = (this.products() ?? []).find(x => Number(x.producto_id) === pid);
    const desc = p?.descripcion ? String(p.descripcion) : `#${pid}`;
    const subtotal = this._round2(cantidad * costo);

    const next = [...(this.draftItems() ?? [])];
    next.push({ producto_id: pid, descripcion: desc, cantidad, costo_unit: costo, subtotal });
    this.draftItems.set(next);

    this.itemForm.reset({ producto_id: null, cantidad: 1, costo_unit: 0 });
  }

  public removeItem(idx: number): void {
    const next = [...(this.draftItems() ?? [])];
    next.splice(idx, 1);
    this.draftItems.set(next);
  }

  public createPurchase(): void {
    if (this.form.invalid) return;
    const det = this.draftItems();
    if (!det || det.length === 0) return;

    const v = this.form.value;

    this._facade.create({
      proveedor_id: Number(v.proveedor_id),
      observacion: (String(v.observacion || '').trim() || null),
      detalle: det.map(x => ({
        producto_id: x.producto_id,
        cantidad: x.cantidad,
        costo_unit: x.costo_unit
      }))
    }).subscribe(res => {
      if (!res) return;
      this.form.reset({ proveedor_id: null, observacion: '' });
      this.draftItems.set([]);
      this.reload();
    });
  }

  public receive(compraId: number): void {
    this._facade.receive(compraId).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public cancel(compraId: number): void {
    this._facade.cancel(compraId).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public estadoBadgeClass(estado: string): string {
    if (estado === 'RECIBIDA') return 'bg-emerald-50 text-emerald-700';
    if (estado === 'ANULADA') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  }

  public supplierName(id: number): string {
    const s = (this.suppliers() ?? []).find(x => Number(x.proveedor_id) === Number(id));
    return s?.nombre ? String(s.nombre) : `#${id}`;
  }

  public productOptions(): TenantProduct[] {
    const q = (this.productPickerQ() || '').trim().toLowerCase();
    const rows = this.products() ?? [];
    if (!q) return rows.slice(0, 50);
    return rows
        .filter(p => String(p.descripcion || '').toLowerCase().includes(q) || String(p.codigo || '').toLowerCase().includes(q))
        .slice(0, 50);
  }

  private _toNumberOrZero(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private _round2(n: number): number {
    return Math.round(n * 100) / 100;
  }
}

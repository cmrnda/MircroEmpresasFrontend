import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantPurchasesApi } from '../tenant-purchases.api';
import { TenantSuppliersApi, TenantSupplier } from '../../suppliers/tenant-suppliers.api';
import { TenantProductsApi, TenantProduct } from '../../products/tenant-products.api';

type CartItem = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  image_url?: string | null;
  cantidad: number;
  costo_unit: number;
  subtotal: number;
};

@Component({
  standalone: true,
  selector: 'app-tenant-purchase-create-pos-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-purchase-create-pos.modal.html'
})
export class TenantPurchaseCreatePosModalComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _api = inject(TenantPurchasesApi);
  private readonly _supApi = inject(TenantSuppliersApi);
  private readonly _prodApi = inject(TenantProductsApi);

  @Output() public closed = new EventEmitter<void>();
  @Output() public created = new EventEmitter<void>();

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly suppliers = signal<TenantSupplier[]>([]);
  public readonly products = signal<TenantProduct[]>([]);
  public readonly q = signal('');

  public readonly cart = signal<CartItem[]>([]);

  public readonly form = this._fb.group({
    proveedor_id: [null as number | null, [Validators.required]],
    observacion: ['']
  });

  public readonly total = computed(() => {
    const rows = this.cart() ?? [];
    return rows.reduce((acc, r) => acc + (Number(r.subtotal) || 0), 0);
  });

  public readonly filteredProducts = computed(() => {
    const text = (this.q() || '').trim().toLowerCase();
    const rows = this.products() ?? [];
    if (!text) return rows.slice(0, 80);
    return rows
      .filter(p => {
        const code = String((p as any).codigo ?? '').toLowerCase();
        const desc = String((p as any).descripcion ?? '').toLowerCase();
        return code.includes(text) || desc.includes(text);
      })
      .slice(0, 80);
  });

  public constructor() {
    this._supApi.list({ includeInactivos: false }).subscribe(res => this.suppliers.set(res.items ?? []));
    this._prodApi.list({ includeInactivos: true }).subscribe(res => this.products.set(res.items ?? []));
  }

  public close(): void {
    this.closed.emit();
  }

  public supplierLabel(id: number): string {
    const s = (this.suppliers() ?? []).find(x => Number(x.proveedor_id) === Number(id));
    return s?.nombre ? String(s.nombre) : `#${id}`;
  }

  public productImg(p: TenantProduct): string | null {
    const primary = String((p as any).primary_image_url ?? '').trim();
    const img = String((p as any).image_url ?? '').trim();
    return primary || img || null;
  }

  public productTitle(p: TenantProduct): string {
    const code = String((p as any).codigo ?? '').trim();
    const desc = String((p as any).descripcion ?? '').trim();
    if (code && desc) return `${code} - ${desc}`;
    return desc || code || `#${Number((p as any).producto_id ?? 0)}`;
  }

  public addToCart(p: TenantProduct): void {
    const pid = Number((p as any).producto_id ?? 0);
    if (!pid) return;

    const code = String((p as any).codigo ?? '').trim();
    const desc = String((p as any).descripcion ?? '').trim();
    const title = desc || code || `#${pid}`;

    const existing = [...(this.cart() ?? [])];
    const idx = existing.findIndex(x => Number(x.producto_id) === pid);

    if (idx >= 0) {
      const nextQty = this._round3((existing[idx].cantidad || 0) + 1);
      existing[idx] = {
        ...existing[idx],
        cantidad: nextQty,
        subtotal: this._round2(nextQty * (existing[idx].costo_unit || 0))
      };
      this.cart.set(existing);
      return;
    }

    const defaultCost = this._toNumberOrZero((p as any).precio ?? 0);
    const qty = 1;
    const costo = defaultCost;
    const subtotal = this._round2(qty * costo);

    existing.unshift({
      producto_id: pid,
      codigo: code || '',
      descripcion: title,
      image_url: this.productImg(p),
      cantidad: qty,
      costo_unit: costo,
      subtotal
    });

    this.cart.set(existing);
  }

  public removeFromCart(idx: number): void {
    const next = [...(this.cart() ?? [])];
    next.splice(idx, 1);
    this.cart.set(next);
  }

  public setQty(idx: number, v: unknown): void {
    const next = [...(this.cart() ?? [])];
    const qty = this._round3(Math.max(0, this._toNumberOrZero(v)));
    const it = next[idx];
    if (!it) return;
    next[idx] = { ...it, cantidad: qty, subtotal: this._round2(qty * (it.costo_unit || 0)) };
    this.cart.set(next);
  }

  public setCost(idx: number, v: unknown): void {
    const next = [...(this.cart() ?? [])];
    const cost = this._round2(Math.max(0, this._toNumberOrZero(v)));
    const it = next[idx];
    if (!it) return;
    next[idx] = { ...it, costo_unit: cost, subtotal: this._round2((it.cantidad || 0) * cost) };
    this.cart.set(next);
  }

  public clearCart(): void {
    this.cart.set([]);
  }

  public create(): void {
    if (this.form.invalid) return;
    const proveedor_id = Number(this.form.value.proveedor_id ?? 0);
    if (!proveedor_id) return;

    const items = this.cart() ?? [];
    if (items.length === 0) return;

    this.loading.set(true);
    this.error.set(null);

    this._api.create({
      proveedor_id,
      observacion: (String(this.form.value.observacion || '').trim() || null),
      detalle: items.map(x => ({
        producto_id: x.producto_id,
        cantidad: x.cantidad,
        costo_unit: x.costo_unit
      }))
    }).subscribe({
      next: () => {
        this.form.reset({ proveedor_id: null, observacion: '' });
        this.cart.set([]);
        this.created.emit();
        this.closed.emit();
      },
      error: (err) => this.error.set(err?.error?.error ?? 'create_failed'),
      complete: () => this.loading.set(false)
    });
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

  private _toNumberOrZero(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private _round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  private _round3(n: number): number {
    return Math.round(n * 1000) / 1000;
  }
}

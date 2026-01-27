import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantPurchasesFacade } from './tenant-purchases.facade';
import { TenantSuppliersApi, TenantSupplier } from '../suppliers/tenant-suppliers.api';
import { TenantPurchaseDetailModalComponent } from './detail-modal/tenant-purchase-detail.modal';
import { TenantPurchaseCreatePosModalComponent } from './create-pos-modal/tenant-purchase-create-pos.modal';

@Component({
  standalone: true,
  selector: 'app-tenant-purchases-page',
  imports: [CommonModule, FormsModule, TenantPurchaseDetailModalComponent, TenantPurchaseCreatePosModalComponent],
  templateUrl: './tenant-purchases.page.html'
})
export class TenantPurchasesPage {
  private readonly _facade = inject(TenantPurchasesFacade);
  private readonly _supApi = inject(TenantSuppliersApi);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly suppliers = signal<TenantSupplier[]>([]);
  public readonly filterSupplierId = signal<number | null>(null);
  public readonly filterEstado = signal<string | null>(null);

  public readonly detailOpen = signal(false);
  public readonly detailCompraId = signal<number | null>(null);

  public readonly createOpen = signal(false);

  public constructor() {
    this._supApi.list({ includeInactivos: false }).subscribe(res => this.suppliers.set(res.items ?? []));
    this.reload();
  }

  public openCreate(): void {
    this.createOpen.set(true);
  }

  public closeCreate(): void {
    this.createOpen.set(false);
  }

  public onCreated(): void {
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

  public estadoBadgeClass(estado: string): string {
    if (estado === 'RECIBIDA') return 'bg-emerald-50 text-emerald-700';
    if (estado === 'ANULADA') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  }

  public supplierNameFromRow(row: { proveedor_id: number; proveedor?: { nombre?: string | null } | null }): string {
    const byPayload = String(row?.proveedor?.nombre ?? '').trim();
    if (byPayload) return byPayload;
    const id = Number(row?.proveedor_id || 0);
    const s = (this.suppliers() ?? []).find(x => Number(x.proveedor_id) === id);
    return s?.nombre ? String(s.nombre) : `#${id}`;
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
}

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TenantOrdersFacade } from './tenant-orders.facade';
import { TenantOrder } from './tenant-orders.api';

@Component({
  standalone: true,
  selector: 'app-tenant-orders-page',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tenant-orders.page.html'
})
export class TenantOrdersPage {
  private readonly _facade = inject(TenantOrdersFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly filterEstado = signal<string | null>(null);
  public readonly filterClienteId = signal<string>('');

  public readonly filtered = computed(() => this.items());

  public constructor() {
    this.reload();
  }

  public reload(): void {
    const estado = (this.filterEstado() || '').trim() || undefined;

    const rawCliente = (this.filterClienteId() || '').trim();
    const clienteId = rawCliente && /^\d+$/.test(rawCliente) ? Number(rawCliente) : undefined;

    this._facade.loadList({ estado, clienteId }).subscribe();
  }

  public badgeClass(estado: string): string {
    const s = String(estado || '').toUpperCase();
    if (s === 'CREADA') return 'bg-slate-100 text-slate-700';
    if (s === 'PAGADA') return 'bg-emerald-50 text-emerald-700';
    if (s === 'CONFIRMADA') return 'bg-blue-50 text-blue-700';
    if (s === 'DESPACHADA') return 'bg-amber-50 text-amber-700';
    if (s === 'ENTREGADA') return 'bg-purple-50 text-purple-700';
    if (s === 'CANCELADA') return 'bg-red-50 text-red-700';
    return 'bg-slate-100 text-slate-700';
  }

  public money(n: number | null | undefined): string {
    const v = Number(n ?? 0);
    return v.toFixed(2);
  }

  public dateText(iso: string | null | undefined): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString();
  }

  public trackById(_: number, row: TenantOrder): number {
    return row.venta_id;
  }
}

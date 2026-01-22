import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TenantOrdersFacade } from './tenant-orders.facade';
import { ShipOrderRequest } from './tenant-orders.api';

@Component({
  standalone: true,
  selector: 'app-tenant-order-detail-page',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './tenant-order-detail.page.html'
})
export class TenantOrderDetailPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantOrdersFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly order = this._facade.current;

  public readonly ventaId = signal<number | null>(null);

  public readonly canShip = computed(() => {
    const o = this.order();
    if (!o) return false;
    const s = String(o.estado || '').toUpperCase();
    return s === 'CREADA' || s === 'PAGADA' || s === 'CONFIRMADA';
  });

  public readonly canComplete = computed(() => {
    const o = this.order();
    if (!o) return false;
    const s = String(o.estado || '').toUpperCase();
    return s === 'DESPACHADA';
  });

  public readonly shipForm = this._fb.group({
    envio_departamento: [''],
    envio_ciudad: [''],
    envio_zona_barrio: [''],
    envio_direccion_linea: [''],
    envio_referencia: [''],
    envio_telefono_receptor: [''],
    envio_costo: [''],
    envio_tracking: ['']
  });

  public constructor() {
    const id = Number(this._route.snapshot.paramMap.get('venta_id'));
    this.ventaId.set(Number.isFinite(id) ? id : null);
    if (this.ventaId() !== null) this.reload();
  }

  public reload(): void {
    const id = this.ventaId();
    if (!id) return;
    this._facade.loadOne(id).subscribe(o => {
      if (!o) return;
      this.shipForm.patchValue({
        envio_departamento: o.envio_departamento ?? '',
        envio_ciudad: o.envio_ciudad ?? '',
        envio_zona_barrio: o.envio_zona_barrio ?? '',
        envio_direccion_linea: o.envio_direccion_linea ?? '',
        envio_referencia: o.envio_referencia ?? '',
        envio_telefono_receptor: o.envio_telefono_receptor ?? '',
        envio_costo: o.envio_costo != null ? String(o.envio_costo) : '',
        envio_tracking: o.envio_tracking ?? ''
      });
    });
  }

  public ship(): void {
    const id = this.ventaId();
    if (!id) return;

    const v = this.shipForm.value;

    const costoRaw = String(v.envio_costo ?? '').trim();
    const costo = costoRaw === '' ? null : Number(costoRaw);

    const payload: ShipOrderRequest = {
      envio_departamento: String(v.envio_departamento ?? '').trim() || null,
      envio_ciudad: String(v.envio_ciudad ?? '').trim() || null,
      envio_zona_barrio: String(v.envio_zona_barrio ?? '').trim() || null,
      envio_direccion_linea: String(v.envio_direccion_linea ?? '').trim() || null,
      envio_referencia: String(v.envio_referencia ?? '').trim() || null,
      envio_telefono_receptor: String(v.envio_telefono_receptor ?? '').trim() || null,
      envio_costo: costo != null && Number.isFinite(costo) ? costo : null,
      envio_tracking: String(v.envio_tracking ?? '').trim() || null,
      envio_estado: 'DESPACHADA',
      envio_fecha_despacho: new Date().toISOString()
    };

    this._facade.ship(id, payload).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public complete(): void {
    const id = this.ventaId();
    if (!id) return;

    this._facade.complete(id).subscribe(res => {
      if (!res) return;
      this.reload();
    });
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
}

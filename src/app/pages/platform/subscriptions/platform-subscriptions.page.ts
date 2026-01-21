import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlatformSubscriptionsFacade } from './platform-subscriptions.facade';
import { PlatformSubscriptionRow } from './platform-subscriptions.api';
import { PlatformPlan, PlatformPlansApi } from '../plans/platform-plans.api';

@Component({
  standalone: true,
  selector: 'app-platform-subscriptions-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './platform-subscriptions.page.html'
})
export class PlatformSubscriptionsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(PlatformSubscriptionsFacade);
  private readonly _plansApi = inject(PlatformPlansApi);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly includeInactivos = signal(false);
  public readonly filterQ = signal('');

  public readonly plans = signal<PlatformPlan[]>([]);

  public readonly editOpen = signal(false);
  public readonly editingEmpresaId = signal<number | null>(null);
  public readonly editingEmpresaNombre = signal<string>('');

  public readonly filtered = computed(() => {
    const q = (this.filterQ() || '').trim().toLowerCase();
    const rows = this.items();

    if (!q) return rows;

    return rows.filter(r => {
      const a = String(r.empresa_id);
      const b = (r.empresa_nombre || '').toLowerCase();
      const c = (r.suscripcion_estado || '').toLowerCase();
      return a.includes(q) || b.includes(q) || c.includes(q);
    });
  });

  public readonly editForm = this._fb.group({
    plan_id: [null as number | null],

    suscripcion_estado: ['INACTIVA', Validators.required],
    suscripcion_inicio: [''],
    suscripcion_fin: [''],
    suscripcion_renovacion: [''],

    ultimo_pago_monto: [null as number | null],
    ultimo_pago_moneda: ['BOB'],
    ultimo_pago_metodo: [''],
    ultimo_pago_referencia_qr: [''],
    ultimo_pago_estado: [''],
    ultimo_pagado_en: ['']
  });


  public constructor() {
    this._plansApi.list().subscribe(res => this.plans.set(res.items ?? []));
    this.reload();
  }

  public reload(): void {
    this._facade.load({ includeInactivos: this.includeInactivos() }).subscribe();
  }

  public openEdit(row: PlatformSubscriptionRow): void {
    this.editingEmpresaId.set(row.empresa_id);
    this.editingEmpresaNombre.set(row.empresa_nombre || '');

    this.editForm.reset({
      plan_id: row.plan_id ?? null,
      suscripcion_estado: row.suscripcion_estado ?? 'INACTIVA',
      suscripcion_inicio: row.suscripcion_inicio ?? '',
      suscripcion_fin: row.suscripcion_fin ?? '',
      suscripcion_renovacion: row.suscripcion_renovacion ?? '',

      ultimo_pago_monto: row.ultimo_pago_monto ?? null,
      ultimo_pago_moneda: row.ultimo_pago_moneda ?? 'BOB',
      ultimo_pago_metodo: row.ultimo_pago_metodo ?? '',
      ultimo_pago_referencia_qr: row.ultimo_pago_referencia_qr ?? '',
      ultimo_pago_estado: row.ultimo_pago_estado ?? '',
      ultimo_pagado_en: row.ultimo_pagado_en ?? ''
    });

    this.editOpen.set(true);
  }


  public closeEdit(): void {
    this.editOpen.set(false);
    this.editingEmpresaId.set(null);
    this.editingEmpresaNombre.set('');
  }

  public saveEdit(): void {
    const empresaId = this.editingEmpresaId();
    if (!empresaId || this.editForm.invalid) return;

    const v = this.editForm.value;

    const payload: any = {
      plan_id: v.plan_id === null || v.plan_id === undefined ? null : Number(v.plan_id),
      suscripcion_estado: String(v.suscripcion_estado || '').trim() || null,
      suscripcion_inicio: String(v.suscripcion_inicio || '').trim() || null,
      suscripcion_fin: String(v.suscripcion_fin || '').trim() || null,
      suscripcion_renovacion: String(v.suscripcion_renovacion || '').trim() || null,

      ultimo_pago_monto: String(v.ultimo_pago_monto || '').trim() ? Number(v.ultimo_pago_monto) : null,
      ultimo_pago_moneda: String(v.ultimo_pago_moneda || '').trim() || null,
      ultimo_pago_metodo: String(v.ultimo_pago_metodo || '').trim() || null,
      ultimo_pago_referencia_qr: String(v.ultimo_pago_referencia_qr || '').trim() || null,
      ultimo_pago_estado: String(v.ultimo_pago_estado || '').trim() || null,
      ultimo_pagado_en: String(v.ultimo_pagado_en || '').trim() || null
    };

    this._facade.update(empresaId, payload).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }

  public planLabel(planId: number | null): string {
    if (!planId) return 'Sin plan';
    const p = this.plans().find(x => x.plan_id === planId);
    return p ? `${p.plan_id} - ${p.nombre}` : `Plan ${planId}`;
  }

  public badgeClass(estado: string | null): string {
    const v = (estado || '').toUpperCase();
    if (v === 'ACTIVA') return 'bg-emerald-50 text-emerald-700';
    if (v === 'VENCIDA') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-700';
  }
}

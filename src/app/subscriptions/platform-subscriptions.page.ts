import {Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {PlatformSubscriptionsFacade} from './platform-subscriptions.facade';
import {Plan, Suscripcion} from './platform-subscriptions.api';

@Component({
  standalone: true,
  selector: 'app-platform-subscriptions-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './platform-subscriptions.page.html'
})
export class PlatformSubscriptionsPage {
  private readonly _facade = inject(PlatformSubscriptionsFacade);
  private readonly _route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);

  public readonly subs = this._facade.subs;
  public readonly plans = this._facade.plans;
  public readonly loading = this._facade.loading;

  public readonly showPayModal = signal(false);
  public readonly selectedSub = signal<Suscripcion | null>(null);

  public readonly planById = computed(() => {
    const map = new Map<number, Plan>();
    for (const p of this.plans()) map.set(p.plan_id, p);
    return map;
  });

  public readonly formCreate = this._fb.group({
    empresa_id: [null as number | null, Validators.required],
    plan_id: [null as number | null, Validators.required]
  });

  public readonly formPay = this._fb.group({
    empresa_id: [null as number | null, Validators.required],
    suscripcion_id: [null as number | null, Validators.required],
    monto: [null as number | null, Validators.required],
    metodo: ['QR' as string | null, Validators.required],
    referencia_qr: ['' as string | null]
  });

  public constructor() {
    const empresaId = Number(this._route.snapshot.queryParamMap.get('empresa_id'));
    this._facade.loadPlans().subscribe(() => {
      const firstPlan = this.plans()[0]?.plan_id ?? null;
      this.formCreate.patchValue({plan_id: firstPlan});
      if (empresaId) {
        this.formCreate.patchValue({empresa_id: empresaId});
        this.load(empresaId);
      }
    });
  }

  public load(empresaId: number): void {
    this._facade.load(empresaId).subscribe();
  }

  public createSubscription(): void {
    if (this.formCreate.invalid) return;

    const v = this.formCreate.value;
    this._facade.create({
      empresa_id: v.empresa_id!,
      plan_id: v.plan_id!
    }).subscribe(() => {
      this.load(v.empresa_id!);
    });
  }

  public selectForPayment(s: Suscripcion): void {
    const plan = this.planById().get(s.plan_id);
    const monto = plan?.precio ?? 0;

    const empresaId = this.formCreate.value.empresa_id ?? s.empresa_id;

    this.selectedSub.set(s);
    this.formPay.patchValue({
      empresa_id: empresaId!,
      suscripcion_id: s.suscripcion_id,
      monto,
      metodo: 'QR',
      referencia_qr: ''
    });
    this.showPayModal.set(true);
  }

  public closeModal(): void {
    this.showPayModal.set(false);
    this.selectedSub.set(null);
  }

  public pay(): void {
    if (this.formPay.invalid) return;

    const v = this.formPay.value;

    this._facade.pay({
      empresa_id: v.empresa_id!,
      suscripcion_id: v.suscripcion_id!,
      monto: v.monto!,
      metodo: v.metodo!,
      referencia_qr: v.referencia_qr || undefined
    }).subscribe(() => {
      this.closeModal();
      this.load(v.empresa_id!);
    });
  }

  public planLabel(planId: number): string {
    const p = this.planById().get(planId);
    if (!p) return `PLAN ${planId}`;
    return `${p.nombre} (${p.periodo_cobro})`;
  }

  public estadoBadgeClass(estado: string): string {
    return estado === 'ACTIVA'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700';
  }
}

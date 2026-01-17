import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantSubscriptionFacade } from './tenant-subscription.facade';
import { Plan } from './tenant-subscription.api';

@Component({
  standalone: true,
  selector: 'app-tenant-subscription-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-subscription.page.html'
})
export class TenantSubscriptionPage {
  private readonly _facade = inject(TenantSubscriptionFacade);
  private readonly _fb = inject(FormBuilder);

  public readonly loading = this._facade.loading;
  public readonly plans = this._facade.plans;
  public readonly status = this._facade.status;

  public readonly showPay = signal(false);

  public readonly selectedPlanId = signal<number | null>(null);

  public readonly selectedPlan = computed<Plan | null>(() => {
    const id = this.selectedPlanId();
    if (!id) return null;
    return this.plans().find(p => p.plan_id === id) ?? null;
  });

  public readonly payForm = this._fb.group({
    metodo: ['QR', Validators.required],
    referencia_qr: ['']
  });

  public constructor() {
    this._facade.loadPlans().subscribe(() => {
      const first = this.plans()[0]?.plan_id ?? null;
      this.selectedPlanId.set(first);
    });
    this.reload();
  }

  public reload(): void {
    this._facade.loadStatus().subscribe();
  }

  public selectPlan(): void {
    const planId = this.selectedPlanId();
    if (!planId) return;

    this._facade.selectPlan(planId).subscribe(() => this.reload());
  }

  public openPay(): void {
    this.showPay.set(true);
  }

  public closePay(): void {
    this.showPay.set(false);
  }

  public pay(): void {
    const st = this.status();
    if (!st?.suscripcion || !st?.plan) return;
    if (this.payForm.invalid) return;

    const metodo = this.payForm.value.metodo!;
    const ref = this.payForm.value.referencia_qr || '';

    this._facade.pay(st.suscripcion.suscripcion_id, st.plan.precio, metodo, ref).subscribe(() => {
      this.closePay();
      this.reload();
    });
  }

  public estadoBadgeClass(estado: string): string {
    return estado === 'ACTIVA'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700';
  }

  public empresaBadgeClass(estado: string): string {
    return estado === 'ACTIVA'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700';
  }

  protected readonly Number = Number;
}

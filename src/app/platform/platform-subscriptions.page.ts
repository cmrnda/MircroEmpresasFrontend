import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlatformSubscriptionsFacade } from './platform-subscriptions.facade';

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
  public readonly loading = this._facade.loading;

  // modal simple
  public readonly showPayModal = signal(false);

  // planes simples (sin backend aun)
  public readonly plans = [
    { id: 1, nombre: 'FREE', precio: 0 },
    { id: 2, nombre: 'BASIC', precio: 100 },
    { id: 3, nombre: 'PRO', precio: 250 }
  ];

  public readonly form = this._fb.group({
    empresa_id: [null as number | null, Validators.required],
    plan_id: [1 as number | null, Validators.required],
    suscripcion_id: [null as number | null],
    monto: [null as number | null, Validators.required],
    metodo: ['QR' as string | null, Validators.required]
  });

  public constructor() {
    const empresaId = Number(this._route.snapshot.queryParamMap.get('empresa_id'));
    if (empresaId) {
      this.form.patchValue({ empresa_id: empresaId });
      this.load(empresaId);
    }
  }

  public load(empresaId: number): void {
    this._facade.load(empresaId).subscribe(list => {
      this.subs.set(list);
    });
  }

  public createSubscription(): void {
    if (this.form.controls.empresa_id.invalid || this.form.controls.plan_id.invalid) return;

    this._facade.create({
      empresa_id: this.form.value.empresa_id!,
      plan_id: this.form.value.plan_id!
    }).subscribe(() => {
      this.load(this.form.value.empresa_id!);
    });
  }

  public selectForPayment(s: any): void {
    this.form.patchValue({
      suscripcion_id: s.suscripcion_id,
      monto: this.getPlanPrice(this.form.value.plan_id!)
    });
    this.showPayModal.set(true);
  }

  public closeModal(): void {
    this.showPayModal.set(false);
  }

  public pay(): void {
    if (
      this.form.controls.empresa_id.invalid ||
      this.form.controls.suscripcion_id.invalid ||
      this.form.controls.monto.invalid
    ) return;

    this._facade.pay({
      empresa_id: this.form.value.empresa_id!,
      suscripcion_id: this.form.value.suscripcion_id!,
      monto: this.form.value.monto!,
      metodo: this.form.value.metodo!
    }).subscribe(() => {
      this.showPayModal.set(false);
      this.load(this.form.value.empresa_id!);
    });
  }

  private getPlanPrice(planId: number): number {
    return this.plans.find(p => p.id === planId)?.precio ?? 0;
  }
}

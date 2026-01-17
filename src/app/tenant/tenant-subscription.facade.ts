import { Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { TenantSubscriptionApi, Plan, SuscripcionStatus } from './tenant-subscription.api';

@Injectable({ providedIn: 'root' })
export class TenantSubscriptionFacade {
  public readonly loading = signal(false);
  public readonly plans = signal<Plan[]>([]);
  public readonly status = signal<SuscripcionStatus | null>(null);

  public constructor(private readonly _api: TenantSubscriptionApi) {}

  public loadPlans() {
    this.loading.set(true);
    return this._api.plans().pipe(
      tap(list => this.plans.set(list)),
      finalize(() => this.loading.set(false))
    );
  }

  public loadStatus() {
    this.loading.set(true);
    return this._api.status().pipe(
      tap(s => this.status.set(s)),
      finalize(() => this.loading.set(false))
    );
  }

  public selectPlan(planId: number) {
    this.loading.set(true);
    return this._api.select(planId).pipe(finalize(() => this.loading.set(false)));
  }

  public pay(suscripcionId: number, monto: number, metodo: string, referenciaQr?: string) {
    this.loading.set(true);
    return this._api.pay({
      suscripcion_id: suscripcionId,
      monto,
      metodo,
      referencia_qr: referenciaQr || undefined
    }).pipe(finalize(() => this.loading.set(false)));
  }
}

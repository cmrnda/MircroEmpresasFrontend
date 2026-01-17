import { Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { PlatformSubscriptionsApi, Plan, Suscripcion } from './platform-subscriptions.api';

@Injectable({ providedIn: 'root' })
export class PlatformSubscriptionsFacade {
  public readonly loading = signal(false);
  public readonly subs = signal<Suscripcion[]>([]);
  public readonly plans = signal<Plan[]>([]);

  public constructor(private readonly _api: PlatformSubscriptionsApi) {}

  public loadPlans() {
    this.loading.set(true);
    return this._api.plans().pipe(
      tap(list => this.plans.set(list)),
      finalize(() => this.loading.set(false))
    );
  }

  public load(empresaId?: number) {
    this.loading.set(true);
    return this._api.list(empresaId).pipe(
      tap(list => this.subs.set(list)),
      finalize(() => this.loading.set(false))
    );
  }

  public create(data: { empresa_id: number; plan_id: number }) {
    this.loading.set(true);
    return this._api.create(data).pipe(finalize(() => this.loading.set(false)));
  }

  public pay(data: {
    empresa_id: number;
    suscripcion_id: number;
    monto: number;
    metodo: string;
    moneda?: string;
    referencia_qr?: string;
  }) {
    this.loading.set(true);
    return this._api.pay(data).pipe(finalize(() => this.loading.set(false)));
  }
}

import { Injectable, signal } from '@angular/core';
import { PlatformSubscriptionsApi } from './platform-subscriptions.api';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlatformSubscriptionsFacade {
  loading = signal(false);
  subs = signal<any[]>([]);

  constructor(private api: PlatformSubscriptionsApi) {}

  load(empresaId?: number) {
    this.loading.set(true);
    return this.api.list(empresaId).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  create(data: any) {
    return this.api.create(data);
  }

  pay(data: any) {
    return this.api.pay(data);
  }
}

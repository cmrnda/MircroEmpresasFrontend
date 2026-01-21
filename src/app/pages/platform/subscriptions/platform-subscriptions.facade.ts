import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { PlatformSubscriptionsApi, PlatformSubscriptionRow, UpdatePlatformSubscriptionRequest } from './platform-subscriptions.api';

@Injectable({ providedIn: 'root' })
export class PlatformSubscriptionsFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<PlatformSubscriptionRow[]>([]);

  public constructor(private readonly _api: PlatformSubscriptionsApi) {}

  public load(opts?: { includeInactivos?: boolean }) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(opts).pipe(
      tap(res => this.items.set(res.items ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.items.set([]);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public get(empresaId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.get(empresaId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'get_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public update(empresaId: number, payload: UpdatePlatformSubscriptionRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.update(empresaId, payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'update_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

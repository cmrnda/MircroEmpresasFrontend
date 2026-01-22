import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { ShipOrderRequest, TenantOrder, TenantOrderFull, TenantOrdersApi } from './tenant-orders.api';

@Injectable({ providedIn: 'root' })
export class TenantOrdersFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly items = signal<TenantOrder[]>([]);
  public readonly current = signal<TenantOrderFull | null>(null);

  public constructor(private readonly _api: TenantOrdersApi) {}

  public loadList(opts?: { estado?: string; clienteId?: number }) {
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

  public loadOne(ventaId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.get(ventaId).pipe(
      tap(res => this.current.set(res)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.current.set(null);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public ship(ventaId: number, payload: ShipOrderRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.ship(ventaId, payload).pipe(
      tap(res => this.current.set(res)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'ship_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public complete(ventaId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.complete(ventaId).pipe(
      tap(res => this.current.set(res)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'complete_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

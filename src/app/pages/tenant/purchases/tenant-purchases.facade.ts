import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { CreateTenantPurchaseRequest, ListTenantPurchasesResponse, TenantPurchase, TenantPurchasesApi } from './tenant-purchases.api';

@Injectable({ providedIn: 'root' })
export class TenantPurchasesFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<TenantPurchase[]>([]);

  public constructor(private readonly _api: TenantPurchasesApi) {}

  public load(opts?: { proveedorId?: number; estado?: string }) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(opts).pipe(
      tap((res: ListTenantPurchasesResponse) => this.items.set(res.items ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.items.set([]);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreateTenantPurchaseRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.create(payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'create_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public receive(compraId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.receive(compraId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'receive_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public cancel(compraId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.cancel(compraId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'cancel_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { CreateTenantSupplierRequest, ListTenantSuppliersResponse, TenantSupplier, TenantSuppliersApi, UpdateTenantSupplierRequest } from './tenant-suppliers.api';

@Injectable({ providedIn: 'root' })
export class TenantSuppliersFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<TenantSupplier[]>([]);

  public constructor(private readonly _api: TenantSuppliersApi) {}

  public load(opts?: { q?: string; includeInactivos?: boolean }) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(opts).pipe(
      tap((res: ListTenantSuppliersResponse) => this.items.set(res.items ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.items.set([]);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreateTenantSupplierRequest) {
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

  public update(proveedorId: number, payload: UpdateTenantSupplierRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.update(proveedorId, payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'update_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public remove(proveedorId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.remove(proveedorId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'remove_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public restore(proveedorId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.restore(proveedorId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'restore_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

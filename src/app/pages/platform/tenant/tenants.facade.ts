import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import {
  CreateTenantRequest,
  Empresa,
  TenantsApi,
  UpdateTenantRequest
} from './tenants.api';

@Injectable({ providedIn: 'root' })
export class TenantsFacade {

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly tenants = signal<Empresa[]>([]);

  public constructor(private readonly _api: TenantsApi) {}

  public load(q?: string, estado?: 'ACTIVA' | 'SUSPENDIDA') {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(q, estado).pipe(
      tap(res => this.tenants.set(res.items ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.tenants.set([]);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreateTenantRequest) {
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

  public update(empresaId: number, payload: UpdateTenantRequest) {
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

  public remove(empresaId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.remove(empresaId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'remove_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

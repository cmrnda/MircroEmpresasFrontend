import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import {
  CreateTenantClientRequest,
  ListTenantClientsResponse,
  TenantClient,
  TenantClientsApi,
  UpdateTenantClientRequest
} from './tenant-clients.api';

@Injectable({ providedIn: 'root' })
export class TenantClientsFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<TenantClient[]>([]);

  public constructor(private readonly _api: TenantClientsApi) {}

  public load(opts?: { q?: string; includeInactivos?: boolean }) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(opts).pipe(
      tap((res: ListTenantClientsResponse) => this.items.set(res.items ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.items.set([]);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreateTenantClientRequest) {
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

  public update(clienteId: number, payload: UpdateTenantClientRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.update(clienteId, payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'update_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public unlink(clienteId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.unlink(clienteId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'unlink_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public restoreLink(clienteId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.restoreLink(clienteId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'restore_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { CreateTenantUserRequest, TenantUser, TenantUsersApi, UpdateTenantUserRequest } from './tenant-users.api';

@Injectable({ providedIn: 'root' })
export class TenantUsersFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<TenantUser[]>([]);

  public constructor(private readonly _api: TenantUsersApi) {}

  public load(opts?: { q?: string; includeInactivos?: boolean }) {
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

  public create(payload: CreateTenantUserRequest) {
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

  public update(usuarioId: number, payload: UpdateTenantUserRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.update(usuarioId, payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'update_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public disable(usuarioId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.disable(usuarioId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'remove_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public restore(usuarioId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.restore(usuarioId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'restore_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

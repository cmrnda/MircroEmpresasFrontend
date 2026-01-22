import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import {
  CreateTenantCategoryRequest,
  ListTenantCategoriesResponse,
  TenantCategoriesApi,
  TenantCategory,
  UpdateTenantCategoryRequest
} from './tenant-categories.api';

@Injectable({ providedIn: 'root' })
export class TenantCategoriesFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<TenantCategory[]>([]);

  public constructor(private readonly _api: TenantCategoriesApi) {}

  public load(opts?: { q?: string; includeInactivos?: boolean }) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(opts).pipe(
      tap((res: ListTenantCategoriesResponse) => this.items.set(res.items ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.items.set([]);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreateTenantCategoryRequest) {
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

  public update(categoriaId: number, payload: UpdateTenantCategoryRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.update(categoriaId, payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'update_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public remove(categoriaId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.remove(categoriaId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'remove_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public restore(categoriaId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.restore(categoriaId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'restore_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

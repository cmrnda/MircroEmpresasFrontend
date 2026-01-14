import { Injectable, signal } from '@angular/core';
import { TenantsApi, Empresa, CreateTenantRequest } from './tenants.api';
import { catchError, finalize, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TenantsFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly tenants = signal<Empresa[]>([]);

  public constructor(private readonly _api: TenantsApi) {}

  public load() {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list().pipe(
      tap(list => this.tenants.set(list)),
      catchError((e: any) => {
        this.error.set(e?.error?.error ?? 'load_failed');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreateTenantRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.create(payload).pipe(
      tap(() => {}),
      catchError((e: any) => {
        this.error.set(e?.error?.error ?? 'create_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public remove(empresaId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.remove(empresaId).pipe(
      tap(() => {}),
      catchError((e: any) => {
        this.error.set(e?.error?.error ?? 'remove_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

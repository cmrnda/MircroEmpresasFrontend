import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { TenantSettings, TenantSettingsApi, UpdateTenantSettingsRequest } from './tenant-settings.api';

@Injectable({ providedIn: 'root' })
export class TenantSettingsFacade {
  public readonly loading = signal(false);
  public readonly saving = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly data = signal<TenantSettings | null>(null);

  public constructor(private readonly _api: TenantSettingsApi) {}

  public load() {
    this.loading.set(true);
    this.error.set(null);

    return this._api.get().pipe(
      tap(res => this.data.set(res ?? null)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.data.set(null);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public save(payload: UpdateTenantSettingsRequest) {
    this.saving.set(true);
    this.error.set(null);

    return this._api.update(payload).pipe(
      tap(res => this.data.set(res ?? null)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'save_failed');
        return of(null);
      }),
      finalize(() => this.saving.set(false))
    );
  }
}

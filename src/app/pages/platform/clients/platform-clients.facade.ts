import {Injectable, signal} from '@angular/core';
import {catchError, finalize, of, tap} from 'rxjs';
import {
  CreatePlatformClientRequest,
  PlatformClient,
  PlatformClientsApi,
  UpdatePlatformClientRequest
} from './platform-clients.api';

@Injectable({providedIn: 'root'})
export class PlatformClientsFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<PlatformClient[]>([]);

  public constructor(private readonly _api: PlatformClientsApi) {
  }

  public load(opts?: { empresaId?: number; q?: string; includeInactivos?: boolean }) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(opts).pipe(
      tap(list => this.items.set(list ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreatePlatformClientRequest) {
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

  public update(clienteId: number, payload: UpdatePlatformClientRequest) {
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

  public remove(clienteId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.remove(clienteId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'remove_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public restore(clienteId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.restore(clienteId).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'restore_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

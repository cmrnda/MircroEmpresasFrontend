import {Injectable, signal} from '@angular/core';
import {ClientsApi, CreateClientRequest, TenantClient, UpdateClientRequest} from './clients.api';
import {catchError, finalize, of, tap} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ClientsFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly clients = signal<TenantClient[]>([]);

  public constructor(private readonly _api: ClientsApi) {
  }

  public load(includeInactivos?: boolean) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list(includeInactivos).pipe(
      tap(list => this.clients.set(list)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        return of([]);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreateClientRequest) {
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

  public update(clienteId: number, payload: UpdateClientRequest) {
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

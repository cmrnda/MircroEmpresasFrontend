import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { SetTenantProductImageRequest, TenantProductImage, TenantProductImageApi } from './tenant-product-image.api';

@Injectable({ providedIn: 'root' })
export class TenantProductImageFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly current = signal<TenantProductImage | null>(null);

  public constructor(private readonly _api: TenantProductImageApi) {}

  public load(productoId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.get(productoId).pipe(
      tap(res => this.current.set(res)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.current.set(null);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public set(productoId: number, payload: SetTenantProductImageRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.set(productoId, payload).pipe(
      tap(res => this.current.set(res)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'save_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public remove(productoId: number) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.remove(productoId).pipe(
      tap(res => this.current.set(res.data)),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'remove_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public clear(): void {
    this.current.set(null);
    this.error.set(null);
  }
}

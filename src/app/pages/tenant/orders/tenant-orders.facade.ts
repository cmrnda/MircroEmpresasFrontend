import {inject, Injectable, signal} from '@angular/core';
import {TenantOrderDetail, TenantOrdersApi, TenantOrdersList} from './tenant-orders.api';

@Injectable({providedIn: 'root'})
export class TenantOrdersFacade {
  private readonly _api = inject(TenantOrdersApi);

  public readonly list = signal<TenantOrdersList>({items: [], page: 1, page_size: 20, total: 0});
  public readonly detail = signal<TenantOrderDetail | null>(null);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly estado = signal<string>('');

  public load(page?: number): void {
    this.loading.set(true);
    this.error.set(null);

    const p = page ? Number(page) : this.list().page;

    this._api.list({
      estado: this.estado().trim() || null,
      page: p,
      page_size: this.list().page_size
    }).subscribe({
      next: (res) => {
        this.list.set(res);
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'load_failed');
        this.loading.set(false);
      }
    });
  }

  public setEstado(v: string): void {
    this.estado.set(v || '');
  }

  public applyEstado(): void {
    this.load(1);
  }

  public loadDetail(venta_id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.get(venta_id).subscribe({
      next: (res) => {
        this.detail.set(res);
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'detail_failed');
        this.loading.set(false);
      }
    });
  }

  public ship(venta_id: number, tracking: string): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.ship(venta_id, tracking).subscribe({
      next: () => this.loadDetail(venta_id),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'ship_failed');
        this.loading.set(false);
      }
    });
  }

  public complete(venta_id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.complete(venta_id).subscribe({
      next: () => this.loadDetail(venta_id),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'complete_failed');
        this.loading.set(false);
      }
    });
  }
}

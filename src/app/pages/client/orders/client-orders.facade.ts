import { Injectable, inject, signal } from '@angular/core';
import { ClientOrdersApi, MyOrdersList, MyOrderDetail } from './client-orders.api';
import { AuthStateService } from '../../../core/auth/auth-state.service';

@Injectable({ providedIn: 'root' })
export class ClientOrdersFacade {
  private readonly _api = inject(ClientOrdersApi);
  private readonly _state = inject(AuthStateService);

  public readonly list = signal<MyOrdersList>({ items: [], page: 1, page_size: 20, total: 0 });
  public readonly detail = signal<MyOrderDetail | null>(null);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  private empresaId(): number {
    return Number(this._state.empresaId() || 0);
  }

  public load(page?: number): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.error.set('empresa_required');
      return;
    }

    const p = page ? Number(page) : this.list().page;

    this.loading.set(true);
    this.error.set(null);

    this._api.listMy(empresa_id, p, this.list().page_size).subscribe({
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

  public loadDetail(venta_id: number): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.error.set('empresa_required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._api.getMy(empresa_id, venta_id).subscribe({
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
}

import {inject, Injectable, signal} from '@angular/core';
import {TenantInventoryApi, TenantInventoryList} from './tenant-inventory.api';

@Injectable({providedIn: 'root'})
export class TenantInventoryFacade {
  private readonly _api = inject(TenantInventoryApi);

  public readonly data = signal<TenantInventoryList>({items: [], page: 1, page_size: 20, total: 0});
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly q = signal<string>('');
  public readonly includeInactivos = signal(false);

  public load(page?: number): void {
    this.loading.set(true);
    this.error.set(null);

    const p = page ? Number(page) : this.data().page;

    this._api.list({
      q: this.q().trim() || null,
      page: p,
      page_size: this.data().page_size,
      include_inactivos: this.includeInactivos()
    }).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'load_failed');
        this.loading.set(false);
      }
    });
  }

  public toggleIncludeInactivos(): void {
    this.includeInactivos.set(!this.includeInactivos());
    this.load(1);
  }

  public setSearch(v: string): void {
    this.q.set(v || '');
  }

  public applySearch(): void {
    this.load(1);
  }

  public adjust(producto_id: number, delta: number): void {
    if (!producto_id || !delta) return;

    this.loading.set(true);
    this.error.set(null);

    this._api.adjust({producto_id, delta}).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'adjust_failed');
        this.loading.set(false);
      }
    });
  }
}

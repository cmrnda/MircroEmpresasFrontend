import {inject, Injectable, signal} from '@angular/core';
import {TenantCategoriesApi, TenantCategory} from './tenant-categories.api';

@Injectable({providedIn: 'root'})
export class TenantCategoriesFacade {
  private readonly _api = inject(TenantCategoriesApi);

  public readonly items = signal<TenantCategory[]>([]);
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly includeInactivos = signal(false);

  public load(): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.list(this.includeInactivos()).subscribe({
      next: (res) => {
        this.items.set(res || []);
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
    this.load();
  }

  public create(nombre: string): void {
    const n = (nombre || '').trim();
    if (!n) return;

    this.loading.set(true);
    this.error.set(null);

    this._api.create({nombre: n}).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'create_failed');
        this.loading.set(false);
      }
    });
  }

  public update(categoria_id: number, payload: { nombre?: string; activo?: boolean }): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.update(categoria_id, payload).subscribe({
      next: (res: any) => {
        if (res?.error) {
          this.error.set(res.error);
          this.loading.set(false);
          return;
        }
        this.load();
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'update_failed');
        this.loading.set(false);
      }
    });
  }

  public remove(categoria_id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.remove(categoria_id).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'delete_failed');
        this.loading.set(false);
      }
    });
  }

  public restore(categoria_id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.restore(categoria_id).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'restore_failed');
        this.loading.set(false);
      }
    });
  }
}

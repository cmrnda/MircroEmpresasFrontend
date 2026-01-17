import { Injectable, inject, signal } from '@angular/core';
import { TenantProductsApi, TenantProduct, TenantProductImage } from './tenant-products.api';
import { TenantCategoriesApi, TenantCategory } from '../categories/tenant-categories.api';

@Injectable({ providedIn: 'root' })
export class TenantProductsFacade {
  private readonly _api = inject(TenantProductsApi);
  private readonly _catsApi = inject(TenantCategoriesApi);

  public readonly items = signal<TenantProduct[]>([]);
  public readonly categories = signal<TenantCategory[]>([]);
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly includeInactivos = signal(false);
  public readonly categoriaId = signal<number | null>(null);
  public readonly q = signal<string>('');

  public readonly selectedProductId = signal<number | null>(null);
  public readonly images = signal<TenantProductImage[]>([]);
  public readonly imagesLoading = signal(false);
  public readonly imagesError = signal<string | null>(null);

  public loadCategories(): void {
    this._catsApi.list(true).subscribe({
      next: (res) => this.categories.set(res || []),
      error: () => this.categories.set([])
    });
  }

  public load(): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.list({
      include_inactivos: this.includeInactivos(),
      categoria_id: this.categoriaId(),
      q: this.q().trim() || null
    }).subscribe({
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

  public setFilterCategoria(id: number | null): void {
    this.categoriaId.set(id);
    this.load();
  }

  public setFilterQ(v: string): void {
    this.q.set(v || '');
  }

  public applySearch(): void {
    this.load();
  }

  public toggleIncludeInactivos(): void {
    this.includeInactivos.set(!this.includeInactivos());
    this.load();
  }

  public create(payload: { categoria_id: number; codigo: string; descripcion: string; precio: number; stock_min: number }): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.create(payload).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'create_failed');
        this.loading.set(false);
      }
    });
  }

  public update(producto_id: number, payload: Partial<TenantProduct>): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.update(producto_id, payload).subscribe({
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

  public remove(producto_id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.remove(producto_id).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'delete_failed');
        this.loading.set(false);
      }
    });
  }

  public restore(producto_id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.restore(producto_id).subscribe({
      next: () => this.load(),
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'restore_failed');
        this.loading.set(false);
      }
    });
  }

  public openImages(producto_id: number): void {
    this.selectedProductId.set(producto_id);
    this.loadImages();
  }

  public closeImages(): void {
    this.selectedProductId.set(null);
    this.images.set([]);
    this.imagesError.set(null);
  }

  public loadImages(): void {
    const pid = this.selectedProductId();
    if (!pid) return;

    this.imagesLoading.set(true);
    this.imagesError.set(null);

    this._api.listImages(pid).subscribe({
      next: (res) => {
        this.images.set(res || []);
        this.imagesLoading.set(false);
      },
      error: (e: any) => {
        this.imagesError.set(e?.error?.error ?? 'images_load_failed');
        this.imagesLoading.set(false);
      }
    });
  }

  public uploadImage(file: File, is_primary: boolean): void {
    const pid = this.selectedProductId();
    if (!pid) return;

    this.imagesLoading.set(true);
    this.imagesError.set(null);

    this._api.uploadImage(pid, file, is_primary).subscribe({
      next: () => this.loadImages(),
      error: (e: any) => {
        this.imagesError.set(e?.error?.error ?? 'upload_failed');
        this.imagesLoading.set(false);
      }
    });
  }

  public setPrimary(image_id: number): void {
    const pid = this.selectedProductId();
    if (!pid) return;

    this.imagesLoading.set(true);
    this.imagesError.set(null);

    this._api.setPrimary(pid, image_id).subscribe({
      next: () => this.loadImages(),
      error: (e: any) => {
        this.imagesError.set(e?.error?.error ?? 'set_primary_failed');
        this.imagesLoading.set(false);
      }
    });
  }

  public deleteImage(image_id: number): void {
    const pid = this.selectedProductId();
    if (!pid) return;

    this.imagesLoading.set(true);
    this.imagesError.set(null);

    this._api.deleteImage(pid, image_id).subscribe({
      next: () => this.loadImages(),
      error: (e: any) => {
        this.imagesError.set(e?.error?.error ?? 'delete_image_failed');
        this.imagesLoading.set(false);
      }
    });
  }
}

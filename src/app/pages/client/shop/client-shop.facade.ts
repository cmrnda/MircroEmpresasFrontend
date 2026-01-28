import { Injectable, inject, signal } from '@angular/core';
import { ClientShopApi, PublicCategory, PublicProductsResponse, ShopProduct } from './client-shop.api';

export const BACKEND_ORIGIN = 'http://127.0.0.1:5000';

@Injectable({ providedIn: 'root' })
export class ClientShopFacade {
  private readonly _api = inject(ClientShopApi);

  public readonly backendOrigin = BACKEND_ORIGIN;

  public readonly categories = signal<PublicCategory[]>([]);
  public readonly products = signal<PublicProductsResponse>({ items: [], page: 1, page_size: 20, total: 0 });

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly q = signal<string>('');
  public readonly categoriaId = signal<number | null>(null);

  private readonly _empresaId = signal<number | null>(null);

  public setEmpresaId(empresa_id: number): void {
    const n = Number(empresa_id);
    this._empresaId.set(Number.isFinite(n) && n > 0 ? n : null);
  }

  private empresaId(): number | null {
    return this._empresaId();
  }

  public loadInit(): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.error.set('empresa_required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._api.listCategories(empresa_id).subscribe({
      next: (cats) => {
        this.categories.set(cats || []);
        this.loadProducts(1);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'categories_failed');
        this.loading.set(false);
      }
    });
  }

  public loadProducts(page: number): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.error.set('empresa_required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._api
      .listProducts(empresa_id, {
        q: this.q().trim() || undefined,
        categoriaId: this.categoriaId(),
        page,
        pageSize: this.products().page_size
      })
      .subscribe({
        next: (res) => {
          this.products.set(res);
          this.loading.set(false);
        },
        error: (e: any) => {
          this.error.set(e?.error?.error ?? 'products_failed');
          this.loading.set(false);
        }
      });
  }

  public setQ(v: string): void {
    this.q.set(v || '');
  }

  public setCategoria(v: string): void {
    const n = v === '' ? null : Number(v);
    this.categoriaId.set(Number.isFinite(n as any) ? n : null);
  }

  public search(): void {
    this.loadProducts(1);
  }

  public prev(): void {
    const p = this.products().page;
    if (p <= 1) return;
    this.loadProducts(p - 1);
  }

  public next(): void {
    const d = this.products();
    const maxPage = Math.max(1, Math.ceil(d.total / d.page_size));

    if (d.items.length < d.page_size) return;
    if (d.page >= maxPage) return;

    this.loadProducts(d.page + 1);
  }

  public imageUrl(p: ShopProduct): string | null {
    return this.normalizeImageUrl((p as any)?.primary_image_url ?? null);
  }

  public normalizeImageUrl(u: string | null): string | null {
    if (!u) return null;

    const s = String(u).trim();
    if (!s) return null;

    if (/^https?:\/\//i.test(s)) return s;
    if (/^data:/i.test(s)) return s;

    if (s.startsWith('/')) return `${this.backendOrigin}${s}`;
    return `${this.backendOrigin}/${s}`;
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { PublicMarketApi, ListPublicTenantsResponse, PublicProduct } from './public-market.api';

export const BACKEND_ORIGIN = 'http://127.0.0.1:5000';

@Injectable()
export class PublicMarketFacade {
  private readonly _api = inject(PublicMarketApi);

  public readonly backendOrigin = BACKEND_ORIGIN;

  public readonly tenants = signal<ListPublicTenantsResponse>({ items: [], page: 1, page_size: 12, total: 0 });
  public readonly random = signal<PublicProduct[]>([]);
  public readonly q = signal<string>('');
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public loadInit(): void {
    this.loadTenants(1);
    this.loadRandom();
  }

  public setQ(v: string): void {
    this.q.set(v || '');
  }

  public search(): void {
    this.loadTenants(1);
  }

  public prev(): void {
    const p = this.tenants().page;
    if (p <= 1) return;
    this.loadTenants(p - 1);
  }

  public next(): void {
    const d = this.tenants();
    const maxPage = Math.max(1, Math.ceil(d.total / d.page_size));
    if (d.page >= maxPage) return;
    this.loadTenants(d.page + 1);
  }

  private loadTenants(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.listTenants({ q: this.q().trim() || undefined, page, pageSize: this.tenants().page_size }).subscribe({
      next: (res) => {
        this.tenants.set({
          items: res?.items || [],
          page: Number(res?.page ?? 1),
          page_size: Number(res?.page_size ?? 12),
          total: Number(res?.total ?? 0)
        });
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'tenants_failed');
        this.loading.set(false);
      }
    });
  }

  private loadRandom(): void {
    this._api.randomProducts(12).subscribe({
      next: (res) => this.random.set(res?.items || []),
      error: () => {}
    });
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

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../cart/cart.service';
import { BACKEND_ORIGIN } from '../market/market.facade';
import {ClientShopApi} from '../store/client-shop.api';
import {ShopProduct} from '../shop/shop.api';

@Component({
  standalone: true,
  selector: 'app-public-product-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './product.page.html'
})
export class PublicProductPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _api = inject(ClientShopApi);
  private readonly _cart = inject(CartService);

  public readonly empresaId = signal<number | null>(null);
  public readonly productoId = signal<number | null>(null);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly p = signal<ShopProduct | null>(null);

  public ngOnInit(): void {
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((pm) => {
      const pid = Number(pm.get('producto_id'));
      this.productoId.set(Number.isFinite(pid) && pid > 0 ? pid : null);
      this.error.set(null);
      this.p.set(null);
      this._load();
    });

    this._route.parent?.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((pm) => {
      const eid = Number(pm.get('empresa_id'));
      const empresa_id = Number.isFinite(eid) && eid > 0 ? eid : null;
      this.empresaId.set(empresa_id);
      this._cart.setEmpresaId(empresa_id);
      this.error.set(null);
      this.p.set(null);
      this._load();
    });
  }

  private _load(): void {
    const empresa_id = this.empresaId();
    const producto_id = this.productoId();
    if (!empresa_id || !producto_id) return;

    this.loading.set(true);
    this.error.set(null);

    this._api.getProduct(empresa_id, producto_id).subscribe({
      next: (res) => {
        const d: any = res as any;
        d.primary_image_url = d.primary_image_url ?? d.image_url ?? null;
        d.cantidad_actual = d.cantidad_actual ?? d.stock ?? 0;
        this.p.set(d);
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'product_failed');
        this.loading.set(false);
      }
    });
  }

  public img(u: string | null): string | null {
    if (!u) return null;
    const s = String(u).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^data:/i.test(s)) return s;
    if (s.startsWith('/')) return `${BACKEND_ORIGIN}${s}`;
    return `${BACKEND_ORIGIN}/${s}`;
  }

  public add(): void {
    const row: any = this.p();
    if (!row) return;
    const payload = { ...row, primary_image_url: this.img((row as any)?.primary_image_url ?? null) };
    this._cart.add(payload, 1);
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
  }
}

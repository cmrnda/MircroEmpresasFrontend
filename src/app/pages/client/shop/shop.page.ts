import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientShopFacade } from './client-shop.facade';
import { CartService } from '../cart/cart.service';

@Component({
  standalone: true,
  selector: 'app-client-shop-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './shop.page.html'
})
export class ClientShopPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);

  public readonly vm = inject(ClientShopFacade);
  private readonly _cart = inject(CartService);

  public readonly empresaId = signal<number | null>(null);

  public ngOnInit(): void {
    const parent = this._route.parent;

    if (!parent) {
      this.empresaId.set(null);
      return;
    }

    parent.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((pm) => {
      const n = Number(pm.get('empresa_id'));
      const empresa_id = Number.isFinite(n) && n > 0 ? n : null;

      this.empresaId.set(empresa_id);

      if (!empresa_id) return;

      this.vm.setEmpresaId(empresa_id);
      this._cart.setEmpresaId(empresa_id);
      this.vm.loadInit();
    });
  }

  public addToCart(p: any): void {
    const img = this.vm.imageUrl(p);
    const payload = { ...p, primary_image_url: img };
    this._cart.add(payload, 1);
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
  }
}

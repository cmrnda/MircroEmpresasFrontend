import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientShopFacade } from './client-shop.facade';
import { CartService } from '../cart/cart.service';
import { ClientAuthModalComponent } from '../auth/client-auth-modal.component';
import { CartModalComponent } from '../cart/cart-modal.component';
import { ClientAuthService } from '../auth/client-auth.service';

@Component({
  standalone: true,
  selector: 'app-client-shop-page',
  imports: [CommonModule, RouterModule, ClientAuthModalComponent, CartModalComponent],
  templateUrl: './shop.page.html'
})
export class ClientShopPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);

  public readonly vm = inject(ClientShopFacade);
  private readonly _cart = inject(CartService);
  private readonly _clientAuth = inject(ClientAuthService);

  public readonly empresaId = signal<number | null>(null);

  public readonly openAuthModal = signal(false);
  public readonly openCartModal = signal(false);

  public ngOnInit(): void {
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      const empresa_id = readEmpresaId(this._route);
      this.empresaId.set(empresa_id);

      if (!empresa_id) {
        this.vm.setEmpresaId(0);
        this._cart.setEmpresaId(null);
        this.vm.error.set('empresa_required');
        return;
      }

      this.vm.setEmpresaId(empresa_id);
      this._cart.setEmpresaId(empresa_id);
      this.vm.loadInit();
    });
  }

  public openCart(): void {
    const empresa_id = Number(this.empresaId() ?? 0);
    if (!Number.isFinite(empresa_id) || empresa_id <= 0) {
      this.vm.error.set('empresa_required');
      return;
    }
    this.openCartModal.set(true);
  }

  public addToCart(p: any): void {
    const empresa_id = Number(this.empresaId() ?? 0);
    if (!Number.isFinite(empresa_id) || empresa_id <= 0) {
      this.vm.error.set('empresa_required');
      return;
    }

    if (!this._clientAuth.loggedIn()) {
      this.openAuthModal.set(true);
      return;
    }

    const img = this.vm.imageUrl(p);
    const payload = { ...p, primary_image_url: img };
    this._cart.add(payload, 1);
  }

  public canAdd(p: any): boolean {
    const n = Number(p?.cantidad_actual ?? 0);
    return Number.isFinite(n) && n > 0;
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
  }
}

function readEmpresaId(route: ActivatedRoute): number | null {
  let cur: ActivatedRoute | null = route;

  while (cur) {
    const raw = cur.snapshot?.paramMap?.get('empresa_id');
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
    cur = cur.parent;
  }

  return null;
}

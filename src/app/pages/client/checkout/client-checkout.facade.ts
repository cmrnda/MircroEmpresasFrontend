import { Injectable, inject, signal } from '@angular/core';
import { ClientCheckoutApi } from './client-checkout.api';
import { AuthStateService } from '../../../core/auth/auth-state.service';
import { CartService } from '../cart/cart.service';

@Injectable({ providedIn: 'root' })
export class ClientCheckoutFacade {
  private readonly _api = inject(ClientCheckoutApi);
  private readonly _state = inject(AuthStateService);
  private readonly _cart = inject(CartService);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly lastVentaId = signal<number | null>(null);

  public checkout(envio: any | null): void {
    const empresa_id = Number(this._state.empresaId() || 0);
    if (!empresa_id) {
      this.error.set('empresa_required');
      return;
    }

    const items = this._cart.items().map(it => ({
      producto_id: it.producto_id,
      cantidad: it.cantidad
    }));

    if (items.length === 0) {
      this.error.set('cart_empty');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.lastVentaId.set(null);

    this._api.createOrder(empresa_id, { items, envio: envio || null }).subscribe({
      next: (res) => {
        this.lastVentaId.set(Number(res?.venta_id || 0));
        this._cart.clear();
        this.loading.set(false);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'checkout_failed');
        this.loading.set(false);
      }
    });
  }
}

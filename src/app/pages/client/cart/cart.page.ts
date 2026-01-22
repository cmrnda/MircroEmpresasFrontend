import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CartService } from './cart.service';

@Component({
  standalone: true,
  selector: 'app-client-cart-page',
  imports: [CommonModule],
  templateUrl: './cart.page.html'
})
export class ClientCartPage {
  private readonly _cart = inject(CartService);

  public readonly items = this._cart.items;
  public readonly total = this._cart.total;

  public inc(producto_id: number): void {
    this._cart.inc(producto_id);
  }

  public dec(producto_id: number): void {
    this._cart.dec(producto_id);
  }

  public setQty(producto_id: number, qty: any): void {
    this._cart.setQty(producto_id, Number(qty));
  }

  public remove(producto_id: number): void {
    this._cart.remove(producto_id);
  }

  public clear(): void {
    this._cart.clear();
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
  }
}

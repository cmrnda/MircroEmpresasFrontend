import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from './cart.service';

@Component({
  standalone: true,
  selector: 'app-client-cart-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.page.html'
})
export class ClientCartPage {
  public readonly cart = inject(CartService);

  public onQtyChange(producto_id: number, v: string): void {
    this.cart.setQty(producto_id, Number(v || 1));
  }
}

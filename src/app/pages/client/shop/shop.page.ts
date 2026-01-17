import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientShopFacade } from './client-shop.facade';
import { CartService } from '../cart/cart.service';

@Component({
  standalone: true,
  selector: 'app-client-shop-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './shop.page.html'
})
export class ClientShopPage {
  public readonly vm = inject(ClientShopFacade);
  private readonly _cart = inject(CartService);

  public ngOnInit(): void {
    this.vm.loadInit();
  }

  public addToCart(p: any): void {
    this._cart.add(p, 1);
  }
}

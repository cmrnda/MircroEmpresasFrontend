import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CartService } from './cart.service';

@Component({
  standalone: true,
  selector: 'app-cart-modal',
  imports: [CommonModule],
  templateUrl: './cart-modal.component.html'
})
export class CartModalComponent {
  private readonly _cart = inject(CartService);

  @Input() public empresaId: number | null = null;

  @Input() public open: boolean = false;
  @Output() public openChange = new EventEmitter<boolean>();

  public items() {
    return this._cart.items();
  }

  public total() {
    return this._cart.total();
  }

  public close(): void {
    this.openChange.emit(false);
  }

  public stop(e: MouseEvent): void {
    e.stopPropagation();
  }

  public inc(item: any): void {
    const id = Number(item?.producto_id ?? 0);
    const qty = Number(item?.qty ?? item?.cantidad ?? 0);
    if (!Number.isFinite(id) || id <= 0) return;
    this._cart.setQty(id, qty + 1);
  }

  public dec(item: any): void {
    const id = Number(item?.producto_id ?? 0);
    const qty = Number(item?.qty ?? item?.cantidad ?? 0);
    if (!Number.isFinite(id) || id <= 0) return;
    const next = Math.max(1, qty - 1);
    this._cart.setQty(id, next);
  }

  public remove(item: any): void {
    const id = Number(item?.producto_id ?? 0);
    if (!Number.isFinite(id) || id <= 0) return;
    this._cart.remove(id);
  }

  public clear(): void {
    this._cart.clear();
  }
}

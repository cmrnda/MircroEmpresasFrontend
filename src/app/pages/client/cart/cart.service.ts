import { Injectable, signal, computed } from '@angular/core';
import type { ShopProduct } from '../shop/client-shop.api';

export type CartItem = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  cantidad: number;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);
  public readonly items = this._items.asReadonly();

  public readonly total = computed(() => {
    return this._items().reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  });

  public add(p: ShopProduct, cantidad: number = 1): void {
    const qty = Math.max(1, Number(cantidad || 1));
    const cur = this._items();
    const idx = cur.findIndex(x => x.producto_id === p.producto_id);

    if (idx >= 0) {
      const next = [...cur];
      next[idx] = { ...next[idx], cantidad: next[idx].cantidad + qty };
      this._items.set(next);
      return;
    }

    this._items.set([
      ...cur,
      {
        producto_id: p.producto_id,
        codigo: p.codigo,
        descripcion: p.descripcion,
        precio: Number(p.precio || 0),
        cantidad: qty
      }
    ]);
  }

  public setQty(producto_id: number, cantidad: number): void {
    const qty = Math.max(1, Number(cantidad || 1));
    this._items.set(this._items().map(it => it.producto_id === producto_id ? { ...it, cantidad: qty } : it));
  }

  public remove(producto_id: number): void {
    this._items.set(this._items().filter(it => it.producto_id !== producto_id));
  }

  public clear(): void {
    this._items.set([]);
  }
}

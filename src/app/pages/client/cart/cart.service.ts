import { Injectable, computed, signal } from '@angular/core';

export type CartItem = {
  producto_id: number;
  descripcion: string;
  precio: number;
  primary_image_url: string | null;
  qty: number;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _empresaId = signal<number | null>(null);
  private readonly _items = signal<CartItem[]>([]);

  public readonly items = computed(() => this._items());
  public readonly count = computed(() => this._items().reduce((a, b) => a + (b.qty || 0), 0));
  public readonly total = computed(() => this._items().reduce((a, b) => a + (Number(b.precio || 0) * Number(b.qty || 0)), 0));

  public setEmpresaId(empresa_id: number | null): void {
    const n = Number(empresa_id);
    const ok = Number.isFinite(n) && n > 0 ? n : null;
    this._empresaId.set(ok);
    this._items.set(this._load(ok));
  }

  public add(p: any, qty: number): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;

    const producto_id = Number(p?.producto_id);
    if (!Number.isFinite(producto_id) || producto_id <= 0) return;

    const q = Math.max(1, Math.trunc(Number(qty) || 1));

    const next = [...this._items()];
    const i = next.findIndex(x => Number(x.producto_id) === producto_id);

    if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + q };
    else {
      next.push({
        producto_id,
        descripcion: String(p?.descripcion || ''),
        precio: Number(p?.precio || 0),
        primary_image_url: (p?.primary_image_url ?? null) as any,
        qty: q
      });
    }

    this._items.set(next);
    this._save(empresa_id, next);
  }

  public inc(producto_id: number): void {
    const row = this._items().find(x => Number(x.producto_id) === Number(producto_id));
    if (!row) return;
    this.setQty(producto_id, row.qty + 1);
  }

  public dec(producto_id: number): void {
    const row = this._items().find(x => Number(x.producto_id) === Number(producto_id));
    if (!row) return;
    this.setQty(producto_id, Math.max(1, row.qty - 1));
  }

  public setQty(producto_id: number, qty: number): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;

    const pid = Number(producto_id);
    const q = Math.max(1, Math.trunc(Number(qty) || 1));

    const next = this._items().map(x => (Number(x.producto_id) === pid ? { ...x, qty: q } : x));
    this._items.set(next);
    this._save(empresa_id, next);
  }

  public remove(producto_id: number): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;

    const pid = Number(producto_id);
    const next = this._items().filter(x => Number(x.producto_id) !== pid);

    this._items.set(next);
    this._save(empresa_id, next);
  }

  public clear(): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;
    this._items.set([]);
    this._save(empresa_id, []);
  }

  private _key(empresa_id: number | null): string {
    return `cart_empresa_${empresa_id || 0}`;
  }

  private _load(empresa_id: number | null): CartItem[] {
    try {
      const raw = localStorage.getItem(this._key(empresa_id));
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr
        .map((x: any) => ({
          producto_id: Number(x?.producto_id),
          descripcion: String(x?.descripcion || ''),
          precio: Number(x?.precio || 0),
          primary_image_url: (x?.primary_image_url ?? null) as any,
          qty: Math.max(1, Math.trunc(Number(x?.qty) || 1))
        }))
        .filter((x: CartItem) => Number.isFinite(x.producto_id) && x.producto_id > 0);
    } catch {
      return [];
    }
  }

  private _save(empresa_id: number, items: CartItem[]): void {
    try {
      localStorage.setItem(this._key(empresa_id), JSON.stringify(items || []));
    } catch {}
  }
}

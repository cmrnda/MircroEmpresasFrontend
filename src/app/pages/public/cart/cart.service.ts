import { Injectable, computed, signal } from '@angular/core';

export type CartItem = {
  producto_id: number;
  descripcion: string;
  precio: number;
  primary_image_url: string | null;
  qty: number;
  max_qty: number | null;
};

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _empresaId = signal<number | null>(null);
  private readonly _items = signal<CartItem[]>([]);

  public readonly items = computed(() => this._items());
  public readonly count = computed(() => this._items().reduce((a, b) => a + toInt(b.qty), 0));
  public readonly total = computed(() => this._items().reduce((a, b) => a + Number(b.precio || 0) * toInt(b.qty), 0));

  public setEmpresaId(empresa_id: number | null): void {
    const n = toInt(empresa_id);
    const ok = n > 0 ? n : null;
    this._empresaId.set(ok);
    this._items.set(this._load(ok));
  }

  public syncStock(rows: Array<{ producto_id: number; cantidad_actual?: number | null }>): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;

    const byId = new Map<number, number>();
    for (const r of rows || []) {
      const pid = toInt((r as any)?.producto_id);
      const stock = toInt((r as any)?.cantidad_actual);
      if (pid > 0) byId.set(pid, stock);
    }

    const next: CartItem[] = [];
    for (const it of this._items()) {
      const pid = toInt(it.producto_id);
      const stock = byId.has(pid) ? toInt(byId.get(pid)) : null;

      const max_qty = stock != null ? (stock > 0 ? stock : 0) : it.max_qty ?? null;

      if (max_qty === 0) continue;

      const qty = clampQty(it.qty, max_qty);

      if (qty <= 0) continue;

      next.push({ ...it, qty, max_qty });
    }

    this._items.set(next);
    this._save(empresa_id, next);
  }

  public add(p: any, qty: number): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;

    const producto_id = toInt(p?.producto_id);
    if (producto_id <= 0) return;

    const max_qty = normalizeMaxQty(p?.cantidad_actual ?? p?.max_qty ?? null);
    const addQty = clampQty(qty, max_qty);

    if (addQty <= 0) return;

    const next = [...this._items()];
    const i = next.findIndex((x) => toInt(x.producto_id) === producto_id);

    if (i >= 0) {
      const prev = next[i];
      const mergedMax = mergeMax(prev.max_qty, max_qty);
      const mergedQty = clampQty(toInt(prev.qty) + addQty, mergedMax);
      if (mergedQty <= 0) {
        next.splice(i, 1);
      } else {
        next[i] = { ...prev, qty: mergedQty, max_qty: mergedMax };
      }
    } else {
      next.push({
        producto_id,
        descripcion: String(p?.descripcion || ''),
        precio: Number(p?.precio || 0),
        primary_image_url: (p?.primary_image_url ?? null) as any,
        qty: addQty,
        max_qty
      });
    }

    this._items.set(next);
    this._save(empresa_id, next);
  }

  public inc(producto_id: number): void {
    const row = this._items().find((x) => toInt(x.producto_id) === toInt(producto_id));
    if (!row) return;
    this.setQty(producto_id, toInt(row.qty) + 1);
  }

  public dec(producto_id: number): void {
    const row = this._items().find((x) => toInt(x.producto_id) === toInt(producto_id));
    if (!row) return;
    this.setQty(producto_id, toInt(row.qty) - 1);
  }

  public setQty(producto_id: number, qty: number): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;

    const pid = toInt(producto_id);
    if (pid <= 0) return;

    const next = this._items()
      .map((x) => {
        if (toInt(x.producto_id) !== pid) return x;

        const q = clampQty(qty, x.max_qty);
        return { ...x, qty: q };
      })
      .filter((x) => clampQty(x.qty, x.max_qty) > 0)
      .filter((x) => (x.max_qty === 0 ? false : true));

    this._items.set(next);
    this._save(empresa_id, next);
  }

  public remove(producto_id: number): void {
    const empresa_id = this._empresaId();
    if (!empresa_id) return;

    const pid = toInt(producto_id);
    const next = this._items().filter((x) => toInt(x.producto_id) !== pid);

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
        .map((x: any) => {
          const producto_id = toInt(x?.producto_id);
          const max_qty = normalizeMaxQty(x?.max_qty ?? null);
          const qty = clampQty(x?.qty, max_qty);

          return {
            producto_id,
            descripcion: String(x?.descripcion || ''),
            precio: Number(x?.precio || 0),
            primary_image_url: (x?.primary_image_url ?? null) as any,
            qty,
            max_qty
          } as CartItem;
        })
        .filter((x: CartItem) => toInt(x.producto_id) > 0 && toInt(x.qty) > 0)
        .filter((x: CartItem) => (x.max_qty === 0 ? false : true));
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

function toInt(v: any): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.trunc(n);
}

function normalizeMaxQty(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = toInt(v);
  if (n <= 0) return 0;
  return n;
}

function mergeMax(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

function clampQty(qty: any, max_qty: number | null): number {
  const q0 = toInt(qty);
  const q = Math.max(1, q0 || 1);

  if (max_qty === null) return q;

  const m = toInt(max_qty);
  if (m <= 0) return 0;

  return Math.min(q, m);
}

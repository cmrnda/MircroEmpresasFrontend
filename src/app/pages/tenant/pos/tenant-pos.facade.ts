import { Injectable, computed, inject, signal } from '@angular/core';
import { TenantPosApi, PosCategory, PosProduct, PosProductsResponse, PosClient, PosCreateSaleResponse } from './tenant-pos.api';
import { PosTicketService } from './pos-ticket.service';

export const BACKEND_ORIGIN = 'http://127.0.0.1:5000';

type ClientForm = {
  nit_ci: string;
  nombre_razon: string;
  telefono: string;
  email: string;
};

type PaymentForm = {
  metodo: string;
  monto: number;
  referencia_qr: string;
  descuento_total: number;
};

@Injectable({ providedIn: 'root' })
export class TenantPosFacade {
  private readonly _api = inject(TenantPosApi);
  private readonly _ticket = inject(PosTicketService);

  public readonly backendOrigin = BACKEND_ORIGIN;

  public readonly empresaId = signal<number | null>(null);

  public readonly categories = signal<PosCategory[]>([]);
  public readonly products = signal<PosProductsResponse>({ items: [], page: 1, page_size: 20, total: 0 });

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly q = signal<string>('');
  public readonly categoriaId = signal<number | null>(null);

  public readonly ticketItems = this._ticket.items;
  public readonly ticketCount = this._ticket.count;
  public readonly ticketSubtotal = this._ticket.subtotal;

  public readonly client = signal<PosClient | null>(null);
  public readonly clientMode = signal<'idle' | 'found' | 'new'>('idle');
  public readonly clientLoading = signal(false);
  public readonly clientError = signal<string | null>(null);

  public readonly clientForm = signal<ClientForm>({
    nit_ci: '',
    nombre_razon: '',
    telefono: '',
    email: ''
  });

  public readonly payment = signal<PaymentForm>({
    metodo: 'EFECTIVO',
    monto: 0,
    referencia_qr: '',
    descuento_total: 0
  });

  public readonly total = computed(() => {
    const sub = Number(this.ticketSubtotal() || 0);
    const disc = toMoney(this.payment().descuento_total);
    return Math.max(0, sub - disc);
  });

  public readonly cambio = computed(() => {
    const p = this.payment();
    if (String(p.metodo || '').toUpperCase() !== 'EFECTIVO') return 0;
    const t = Number(this.total() || 0);
    const m = toMoney(p.monto);
    return Math.max(0, m - t);
  });

  public readonly placing = signal(false);
  public readonly placeError = signal<string | null>(null);
  public readonly successVentaId = signal<number | null>(null);

  public setEmpresaId(empresa_id: number | null): void {
    const n = Number(empresa_id);
    const ok = Number.isFinite(n) && n > 0 ? n : null;

    this.empresaId.set(ok);
    this._ticket.setEmpresaId(ok);

    this.error.set(null);
    this.placeError.set(null);
    this.successVentaId.set(null);

    this.client.set(null);
    this.clientMode.set('idle');
    this.clientError.set(null);
    this.clientLoading.set(false);

    const cf = this.clientForm();
    this.clientForm.set({ ...cf, nit_ci: '', nombre_razon: '', telefono: '', email: '' });

    const pay = this.payment();
    this.payment.set({ ...pay, metodo: 'EFECTIVO', monto: 0, referencia_qr: '', descuento_total: 0 });
  }

  public loadInit(): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.error.set('empresa_required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._api.listCategories(empresa_id).subscribe({
      next: (cats) => {
        this.categories.set(cats || []);
        this.loadProducts(1);
      },
      error: (e: any) => {
        this.error.set(e?.error?.error ?? 'categories_failed');
        this.loading.set(false);
      }
    });
  }

  public loadProducts(page: number): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.error.set('empresa_required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this._api
      .listProducts(empresa_id, {
        q: this.q().trim() || undefined,
        categoriaId: this.categoriaId(),
        page,
        pageSize: this.products().page_size
      })
      .subscribe({
        next: (res) => {
          this.products.set(res);
          this._ticket.syncStock(res.items as any);
          this.loading.set(false);
        },
        error: (e: any) => {
          this.error.set(e?.error?.error ?? 'products_failed');
          this.loading.set(false);
        }
      });
  }

  public setQ(v: string): void {
    this.q.set(v || '');
  }

  public setCategoria(v: string): void {
    const n = v === '' ? null : Number(v);
    this.categoriaId.set(Number.isFinite(n as any) ? n : null);
  }

  public search(): void {
    this.loadProducts(1);
  }

  public prev(): void {
    const p = this.products().page;
    if (p <= 1) return;
    this.loadProducts(p - 1);
  }

  public next(): void {
    const d = this.products();
    const maxPage = Math.max(1, Math.ceil(d.total / d.page_size));

    if (d.items.length < d.page_size) return;
    if (d.page >= maxPage) return;

    this.loadProducts(d.page + 1);
  }

  public imageUrl(p: PosProduct): string | null {
    return this.normalizeImageUrl((p as any)?.primary_image_url ?? null);
  }

  public normalizeImageUrl(u: string | null): string | null {
    if (!u) return null;
    const s = String(u).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^data:/i.test(s)) return s;
    if (s.startsWith('/')) return `${this.backendOrigin}${s}`;
    return `${this.backendOrigin}/${s}`;
  }

  public addToTicket(p: any): void {
    const img = this.imageUrl(p);
    const payload = { ...p, primary_image_url: img };
    this._ticket.add(payload, 1);
  }

  public inc(producto_id: number): void {
    this._ticket.inc(producto_id);
  }

  public dec(producto_id: number): void {
    this._ticket.dec(producto_id);
  }

  public setQty(producto_id: number, qty: any): void {
    this._ticket.setQty(producto_id, Number(qty));
  }

  public remove(producto_id: number): void {
    this._ticket.remove(producto_id);
  }

  public clearTicket(): void {
    this._ticket.clear();
    this.placeError.set(null);
    this.successVentaId.set(null);
  }

  public setClientField(k: keyof ClientForm, v: any): void {
    const cur = this.clientForm();
    const next: ClientForm = { ...cur, [k]: String(v ?? '') } as any;
    this.clientForm.set(next);

    if (k === 'nit_ci') {
      this.clientError.set(null);
      this.clientMode.set('idle');
      this.client.set(null);
    }
  }

  public clearClient(): void {
    const cf = this.clientForm();
    this.clientForm.set({ ...cf, nit_ci: '', nombre_razon: '', telefono: '', email: '' });
    this.client.set(null);
    this.clientMode.set('idle');
    this.clientError.set(null);
  }

  public lookupClient(): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.clientError.set('empresa_required');
      return;
    }

    const nit = cleanStr(this.clientForm().nit_ci);
    if (!nit) {
      this.clientError.set('nit_required');
      return;
    }

    this.clientLoading.set(true);
    this.clientError.set(null);
    this.client.set(null);
    this.clientMode.set('idle');

    this._api.lookupClient(empresa_id, nit).subscribe({
      next: (res) => {
        if (res?.found && res?.client) {
          this.client.set(res.client);
          this.clientMode.set('found');

          const cf = this.clientForm();
          this.clientForm.set({
            ...cf,
            nit_ci: String(res.client.nit_ci ?? nit),
            nombre_razon: String(res.client.nombre_razon ?? ''),
            telefono: String(res.client.telefono ?? ''),
            email: String(res.client.email ?? '')
          });
        } else {
          this.client.set(null);
          this.clientMode.set('new');
        }
        this.clientLoading.set(false);
      },
      error: (e: any) => {
        this.clientError.set(e?.error?.error ?? 'lookup_failed');
        this.clientLoading.set(false);
      }
    });
  }

  public createClient(): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.clientError.set('empresa_required');
      return;
    }

    const f = this.clientForm();
    const nombre = cleanStr(f.nombre_razon);
    if (!nombre) {
      this.clientError.set('nombre_required');
      return;
    }

    this.clientLoading.set(true);
    this.clientError.set(null);

    this._api
      .createClient(empresa_id, {
        nit_ci: cleanStr(f.nit_ci),
        nombre_razon: nombre,
        telefono: cleanStr(f.telefono),
        email: cleanStr(f.email)
      })
      .subscribe({
        next: (c) => {
          this.client.set(c);
          this.clientMode.set('found');

          const cf = this.clientForm();
          this.clientForm.set({
            ...cf,
            nit_ci: String(c?.nit_ci ?? cleanStr(f.nit_ci) ?? ''),
            nombre_razon: String(c?.nombre_razon ?? nombre),
            telefono: String(c?.telefono ?? ''),
            email: String(c?.email ?? '')
          });

          this.clientLoading.set(false);
        },
        error: (e: any) => {
          this.clientError.set(e?.error?.error ?? 'create_client_failed');
          this.clientLoading.set(false);
        }
      });
  }

  public setPaymentField(k: keyof PaymentForm, v: any): void {
    const cur = this.payment();
    const next: PaymentForm = { ...cur };

    if (k === 'monto' || k === 'descuento_total') {
      (next as any)[k] = toMoney(v);
    } else {
      (next as any)[k] = String(v ?? '');
    }

    if (k === 'metodo') {
      const m = String((next as any).metodo || '').toUpperCase();
      (next as any).metodo = m || 'EFECTIVO';
      if (m !== 'EFECTIVO') (next as any).monto = 0;
      if (m !== 'QR') (next as any).referencia_qr = '';
    }

    this.payment.set(next);
  }

  public createSale(): void {
    this.placeError.set(null);
    this.successVentaId.set(null);

    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.placeError.set('empresa_required');
      return;
    }

    const rows = this.ticketItems();
    if (!rows.length) {
      this.placeError.set('ticket_empty');
      return;
    }

    const c = this.client();
    const cf = this.clientForm();

    const nit = cleanStr(cf.nit_ci);
    const nombre = cleanStr(cf.nombre_razon);

    if (!c && !nombre) {
      this.placeError.set('cliente_required');
      return;
    }

    const pay = this.payment();
    const metodo = cleanStr(pay.metodo)?.toUpperCase() ?? null;

    if (metodo === 'EFECTIVO') {
      const t = Number(this.total() || 0);
      const m = toMoney(pay.monto);
      if (m < t) {
        this.placeError.set('pago_insuficiente');
        return;
      }
    }

    this.placing.set(true);

    const payload = {
      cliente: c ? ({ cliente_id: Number(c.cliente_id) } as any) : ({ nit_ci: nit, nombre_razon: nombre, telefono: cleanStr(cf.telefono), email: cleanStr(cf.email) } as any),
      items: rows.map((it) => ({
        producto_id: Number(it.producto_id),
        cantidad: Number(it.qty),
        precio_unit: Number(it.precio),
        descuento: 0
      })),
      descuento_total: toMoney(pay.descuento_total),
      pago: {
        metodo: metodo,
        monto: metodo ? (metodo === 'EFECTIVO' ? toMoney(pay.monto) : toMoney(pay.monto)) : null,
        referencia_qr: metodo === 'QR' ? cleanStr(pay.referencia_qr) : null
      }
    };

    this._api.createSale(empresa_id, payload as any).subscribe({
      next: (res: PosCreateSaleResponse) => {
        const venta_id = Number((res as any)?.venta?.venta_id ?? 0) || null;
        this.successVentaId.set(venta_id);

        this._ticket.clear();

        const p0 = this.payment();
        this.payment.set({ ...p0, monto: 0, referencia_qr: '' });

        this.loadProducts(this.products().page);

        this.placing.set(false);
      },
      error: (e: any) => {
        this.placeError.set(e?.error?.error ?? 'sale_failed');
        this.placing.set(false);
      }
    });
  }
}

function cleanStr(v: any): string | null {
  const s = String(v ?? '').trim();
  return s ? s : null;
}

function toMoney(v: any): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

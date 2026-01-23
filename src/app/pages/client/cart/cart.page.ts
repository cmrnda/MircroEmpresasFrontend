import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from './cart.service';
import { ClientShopApi, CreateOrderPayload } from '../shop/client-shop.api';

type CheckoutForm = {
  envio_departamento: string;
  envio_ciudad: string;
  envio_zona_barrio: string;
  envio_direccion_linea: string;
  envio_referencia: string;
  envio_telefono_receptor: string;
  envio_costo: number;
  descuento_total: number;
};

@Component({
  standalone: true,
  selector: 'app-client-cart-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.page.html'
})
export class ClientCartPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _cart = inject(CartService);
  private readonly _api = inject(ClientShopApi);

  public readonly items = this._cart.items;
  public readonly total = this._cart.total;

  public readonly empresaId = signal<number | null>(null);

  public readonly placing = signal(false);
  public readonly placeError = signal<string | null>(null);
  public readonly successVentaId = signal<number | null>(null);

  public readonly form = signal<CheckoutForm>({
    envio_departamento: '',
    envio_ciudad: '',
    envio_zona_barrio: '',
    envio_direccion_linea: '',
    envio_referencia: '',
    envio_telefono_receptor: '',
    envio_costo: 0,
    descuento_total: 0
  });

  public readonly shipModal = signal(false);
  public readonly shipErrors = signal<string[]>([]);

  public ngOnInit(): void {
    const parent = this._route.parent;

    if (!parent) {
      this.empresaId.set(null);
      this._cart.setEmpresaId(null);
      return;
    }

    parent.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((pm) => {
      const n = Number(pm.get('empresa_id'));
      const empresa_id = Number.isFinite(n) && n > 0 ? n : null;

      this.empresaId.set(empresa_id);
      this._cart.setEmpresaId(empresa_id);

      this.placeError.set(null);
      this.successVentaId.set(null);

      this.shipModal.set(false);
      this.shipErrors.set([]);
    });
  }

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
    this.placeError.set(null);
    this.successVentaId.set(null);
  }

  public setField(k: keyof CheckoutForm, v: any): void {
    const cur = this.form();
    const next: CheckoutForm = { ...cur };

    if (k === 'envio_costo' || k === 'descuento_total') {
      (next as any)[k] = toMoney(v);
    } else {
      (next as any)[k] = String(v ?? '');
    }

    this.form.set(next);

    if (this.shipModal()) {
      this.shipErrors.set(this._shippingErrors(next));
    }
  }

  public openShippingModal(): void {
    this.shipErrors.set(this._shippingErrors(this.form()));
    this.shipModal.set(true);
  }

  public closeShippingModal(): void {
    this.shipModal.set(false);
  }

  public shippingReady(): boolean {
    return this._shippingErrors(this.form()).length === 0;
  }

  public shippingSummary(): string {
    const f = this.form();

    const dept = cleanStr(f.envio_departamento);
    const city = cleanStr(f.envio_ciudad);
    const zone = cleanStr(f.envio_zona_barrio);
    const addr = cleanStr(f.envio_direccion_linea);
    const tel = cleanStr(f.envio_telefono_receptor);

    const parts = [dept, city, zone, addr, tel].filter((x) => !!x) as string[];
    if (!parts.length) return 'Sin datos de envio';
    return parts.join(' - ');
  }

  public labelErr(code: string): string {
    switch (code) {
      case 'departamento_required':
        return 'Departamento requerido';
      case 'ciudad_required':
        return 'Ciudad requerida';
      case 'zona_required':
        return 'Zona o barrio requerido';
      case 'direccion_required':
        return 'Direccion requerida';
      case 'telefono_required':
        return 'Telefono requerido';
      case 'telefono_invalid':
        return 'Telefono invalido';
      default:
        return code;
    }
  }

  public checkout(): void {
    this.placeError.set(null);
    this.successVentaId.set(null);

    const errs = this._shippingErrors(this.form());
    if (errs.length) {
      this.shipErrors.set(errs);
      this.shipModal.set(true);
      return;
    }

    this._placeOrder();
  }

  public confirmShippingAndCheckout(): void {
    const errs = this._shippingErrors(this.form());
    this.shipErrors.set(errs);

    if (errs.length) return;

    this.shipModal.set(false);
    this._placeOrder();
  }

  private _placeOrder(): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.placeError.set('empresa_required');
      return;
    }

    const rows = this.items();
    if (!rows.length) {
      this.placeError.set('cart_empty');
      return;
    }

    this.placing.set(true);
    this.placeError.set(null);
    this.successVentaId.set(null);

    const f = this.form();

    const payload: CreateOrderPayload = {
      items: rows.map((it) => ({
        producto_id: Number(it.producto_id),
        cantidad: Number(it.qty),
        precio_unit: Number(it.precio),
        descuento: 0
      })),
      descuento_total: toMoney(f.descuento_total),
      envio_departamento: cleanStr(f.envio_departamento),
      envio_ciudad: cleanStr(f.envio_ciudad),
      envio_zona_barrio: cleanStr(f.envio_zona_barrio),
      envio_direccion_linea: cleanStr(f.envio_direccion_linea),
      envio_referencia: cleanStr(f.envio_referencia),
      envio_telefono_receptor: cleanStr(f.envio_telefono_receptor),
      envio_costo: toMoney(f.envio_costo)
    };

    this._api.createOrder(empresa_id, payload).subscribe({
      next: (res) => {
        const venta_id = Number((res as any)?.venta_id ?? 0) || null;
        this.successVentaId.set(venta_id);
        this._cart.clear();
        this.placing.set(false);
      },
      error: (e: any) => {
        this.placeError.set(e?.error?.error ?? 'order_failed');
        this.placing.set(false);
      }
    });
  }

  private _shippingErrors(f: CheckoutForm): string[] {
    const errs: string[] = [];

    if (!cleanStr(f.envio_departamento)) errs.push('departamento_required');
    if (!cleanStr(f.envio_ciudad)) errs.push('ciudad_required');
    if (!cleanStr(f.envio_zona_barrio)) errs.push('zona_required');
    if (!cleanStr(f.envio_direccion_linea)) errs.push('direccion_required');

    const tel = cleanStr(f.envio_telefono_receptor);
    if (!tel) {
      errs.push('telefono_required');
    } else {
      const digits = String(tel).replace(/\D/g, '');
      if (digits.length < 7) errs.push('telefono_invalid');
    }

    return errs;
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
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

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '../../core/auth/auth.facade';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { CartService } from '../../pages/client/cart/cart.service';
import { API_BASE } from '../../core/http/api-base';

type AuthMode = 'login' | 'signup';

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

type ShipErrKey =
  | 'envio_departamento'
  | 'envio_ciudad'
  | 'envio_zona_barrio'
  | 'envio_direccion_linea'
  | 'envio_telefono_receptor';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  imports: [CommonModule, RouterOutlet, RouterModule, ReactiveFormsModule],
  templateUrl: './client-layout.component.html'
})
export class ClientLayoutComponent {
  private readonly _auth = inject(AuthFacade);
  private readonly _state = inject(AuthStateService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _fb = inject(FormBuilder);
  private readonly _http = inject(HttpClient);

  public readonly cart = inject(CartService);

  public readonly empresaId = this._state.empresaId;
  public readonly clienteId = this._state.clienteId;

  private readonly _url = signal<string>(this._router.url);

  public readonly cartOpen = signal(false);
  public readonly checkoutOpen = signal(false);
  public readonly authOpen = signal(false);

  public readonly placing = signal(false);
  public readonly placeError = signal<string | null>(null);
  public readonly placeOk = signal(false);
  public readonly placeVentaId = signal<number | null>(null);

  public readonly authMode = signal<AuthMode>('login');
  public readonly authLoading = signal(false);
  public readonly authError = signal<string | null>(null);
  private readonly _afterAuthPlace = signal(false);

  public readonly hasToken = computed(() => !!this._state.token());

  public readonly headerTitle = computed(() => {
    const u = this._url();
    if (u.includes('/shop')) return 'Tienda';
    return 'Cliente';
  });

  public readonly loginForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  public readonly signupForm = this._fb.group({
    nombre_razon: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nit_ci: [''],
    telefono: ['']
  });

  public readonly checkoutForm = signal<CheckoutForm>({
    envio_departamento: '',
    envio_ciudad: '',
    envio_zona_barrio: '',
    envio_direccion_linea: '',
    envio_referencia: '',
    envio_telefono_receptor: '',
    envio_costo: 0,
    descuento_total: 0
  });

  public readonly shipErrors = computed<ShipErrKey[]>(() => {
    const f = this.checkoutForm();
    const errs: ShipErrKey[] = [];

    if (!cleanStr(f.envio_departamento)) errs.push('envio_departamento');
    if (!cleanStr(f.envio_ciudad)) errs.push('envio_ciudad');
    if (!cleanStr(f.envio_zona_barrio)) errs.push('envio_zona_barrio');
    if (!cleanStr(f.envio_direccion_linea)) errs.push('envio_direccion_linea');
    if (!isPhoneOk(f.envio_telefono_receptor)) errs.push('envio_telefono_receptor');

    return errs;
  });

  public readonly shippingReady = computed(() => this.shipErrors().length === 0);

  public readonly shippingSummary = computed(() => {
    const f = this.checkoutForm();
    const dep = cleanStr(f.envio_departamento);
    const ciu = cleanStr(f.envio_ciudad);
    const zon = cleanStr(f.envio_zona_barrio);
    const dir = cleanStr(f.envio_direccion_linea);

    const parts = [dep, ciu, zon, dir].filter(Boolean) as string[];
    return parts.length ? parts.join(' - ') : 'Completa tus datos de envio';
  });

  public constructor() {
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((pm) => {
      const n = Number(pm.get('empresa_id'));
      const empresa_id = Number.isFinite(n) && n > 0 ? n : null;

      this._state.empresaId.set(empresa_id);
      this.cart.setEmpresaId(empresa_id);

      this.placeError.set(null);
      this.placeOk.set(false);
      this.placeVentaId.set(null);

      if (!empresa_id) {
        this.cartOpen.set(false);
        this.checkoutOpen.set(false);
        this.authOpen.set(false);
      }
    });

    this._router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => this._url.set(this._router.url));
  }

  public fmt(n: number): string {
    const x = Number(n || 0);
    return String(x.toFixed(2));
  }

  public logout(): void {
    this._auth.logout().subscribe();
  }

  public openCart(): void {
    if (!this.empresaId()) return;
    this.cartOpen.set(true);
    this.placeError.set(null);
    this.placeOk.set(false);
    this.placeVentaId.set(null);
  }

  public closeCart(): void {
    this.cartOpen.set(false);
  }

  public openCheckout(): void {
    if (!this.empresaId()) return;
    if (this.cart.items().length === 0) return;

    this.checkoutOpen.set(true);
    this.cartOpen.set(false);

    this.placeError.set(null);
    this.placeOk.set(false);
    this.placeVentaId.set(null);
  }

  public closeCheckout(): void {
    this.checkoutOpen.set(false);
  }

  public setShipField(k: keyof CheckoutForm, v: any): void {
    const cur = this.checkoutForm();
    const next: CheckoutForm = { ...cur };

    if (k === 'envio_costo' || k === 'descuento_total') {
      next[k] = toMoney(v) as any;
    } else {
      next[k] = String(v ?? '');
    }

    this.checkoutForm.set(next);

    if (this.placeError() === 'shipping_required') {
      this.placeError.set(null);
    }
  }

  public labelShipErr(k: ShipErrKey): string {
    if (k === 'envio_departamento') return 'Departamento';
    if (k === 'envio_ciudad') return 'Ciudad';
    if (k === 'envio_zona_barrio') return 'Zona o barrio';
    if (k === 'envio_direccion_linea') return 'Direccion exacta';
    return 'Telefono del receptor';
  }

  public openAuth(mode: AuthMode, placeAfter: boolean): void {
    this.authError.set(null);
    this.authMode.set(mode);
    this.authOpen.set(true);
    this._afterAuthPlace.set(placeAfter);
  }

  public closeAuth(): void {
    this.authOpen.set(false);
    this._afterAuthPlace.set(false);
    this.authError.set(null);
    this.authLoading.set(false);
  }

  public switchToSignup(): void {
    const v = this.loginForm.value;
    const email = String(v.email || '').trim();
    if (email) this.signupForm.patchValue({ email });
    this.authMode.set('signup');
    this.authError.set(null);
  }

  public switchToLogin(): void {
    const v = this.signupForm.value;
    const email = String(v.email || '').trim();
    if (email) this.loginForm.patchValue({ email });
    this.authMode.set('login');
    this.authError.set(null);
  }

  public doLogin(): void {
    if (this.loginForm.invalid) return;

    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.authError.set('empresa_required');
      return;
    }

    const v = this.loginForm.value;

    this.authLoading.set(true);
    this.authError.set(null);

    this._auth
      .login('client', {
        email: String(v.email || '').trim(),
        password: String(v.password || ''),
        empresa_id: Number(empresa_id)
      })
      .subscribe({
        next: (ok) => {
          this.authLoading.set(false);
          if (!ok) {
            this.authError.set('invalid_credentials');
            return;
          }
          this.authOpen.set(false);

          if (this._afterAuthPlace()) {
            this._afterAuthPlace.set(false);
            this.placeOrder();
          }
        },
        error: (e: any) => {
          this.authLoading.set(false);
          this.authError.set(e?.error?.error ?? 'login_failed');
        }
      });
  }

  public doSignup(): void {
    if (this.signupForm.invalid) return;

    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.authError.set('empresa_required');
      return;
    }

    const v = this.signupForm.value;

    this.authLoading.set(true);
    this.authError.set(null);

    const payload = {
      empresa_id: Number(empresa_id),
      nombre_razon: String(v.nombre_razon || '').trim(),
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      nit_ci: String(v.nit_ci || '').trim() || null,
      telefono: String(v.telefono || '').trim() || null
    };

    this._http.post<any>(`${API_BASE}/auth/client/signup`, payload).subscribe({
      next: () => {
        this.authLoading.set(false);

        this.loginForm.patchValue({
          email: payload.email,
          password: payload.password
        });

        this.authMode.set('login');
        this.doLogin();
      },
      error: (e: any) => {
        this.authLoading.set(false);
        this.authError.set(e?.error?.error ?? 'signup_failed');
      }
    });
  }

  public placeOrder(): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.placeError.set('empresa_required');
      return;
    }

    if (this.cart.items().length === 0) {
      this.placeError.set('empty_cart');
      return;
    }

    if (!this.shippingReady()) {
      this.placeError.set('shipping_required');
      this.checkoutOpen.set(true);
      return;
    }

    if (!this.hasToken()) {
      this.openAuth('login', true);
      return;
    }

    this.placing.set(true);
    this.placeError.set(null);
    this.placeOk.set(false);
    this.placeVentaId.set(null);

    const f = this.checkoutForm();

    const payload = {
      items: this.cart.items().map((x) => ({
        producto_id: Number(x.producto_id),
        cantidad: Number(x.qty)
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

    this._http.post<any>(`${API_BASE}/shop/${empresa_id}/orders`, payload).subscribe({
      next: (res) => {
        this.placing.set(false);
        this.placeOk.set(true);

        const venta_id = Number(res?.venta_id ?? 0);
        this.placeVentaId.set(venta_id > 0 ? venta_id : null);

        this.cart.clear();
      },
      error: (e: any) => {
        this.placing.set(false);

        if (e?.status === 401) {
          this.openAuth('login', true);
          return;
        }

        this.placeError.set(e?.error?.error ?? 'order_failed');
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

function isPhoneOk(v: any): boolean {
  const s = String(v ?? '').trim();
  if (!s) return false;
  const digits = s.replace(/[^\d]/g, '');
  return digits.length >= 7;
}

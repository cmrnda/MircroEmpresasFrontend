import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthFacade } from '../../core/auth/auth.facade';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { CartService } from '../../pages/client/cart/cart.service';
import { API_BASE } from '../../core/http/api-base';

type AuthMode = 'login' | 'signup';

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

  public readonly authMode = signal<AuthMode>('login');
  public readonly authLoading = signal(false);
  public readonly authError = signal<string | null>(null);
  private readonly _afterAuthPlace = signal(false);

  public readonly hasToken = computed(() => !!this._state.token());

  public readonly headerTitle = computed(() => {
    const u = this._url();
    if (u.includes('/shop')) return 'Shop';
    if (u.includes('/cart')) return 'Cart';
    return 'Client';
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

  public constructor() {
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((pm) => {
      const n = Number(pm.get('empresa_id'));
      const empresa_id = Number.isFinite(n) && n > 0 ? n : null;

      this._state.empresaId.set(empresa_id);
      this.cart.setEmpresaId(empresa_id);

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
  }

  public closeCheckout(): void {
    this.checkoutOpen.set(false);
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

    if (!this.hasToken()) {
      this.openAuth('login', true);
      return;
    }

    this.placing.set(true);
    this.placeError.set(null);
    this.placeOk.set(false);

    const payload = {
      items: this.cart.items().map((x) => ({
        producto_id: Number(x.producto_id),
        cantidad: Number(x.qty)
      }))
    };

    this._http.post<any>(`${API_BASE}/shop/${empresa_id}/orders`, payload).subscribe({
      next: () => {
        this.placing.set(false);
        this.placeOk.set(true);
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

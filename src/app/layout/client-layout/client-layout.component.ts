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
  public readonly loginOpen = signal(false);

  public readonly placing = signal(false);
  public readonly placeError = signal<string | null>(null);
  public readonly placeOk = signal(false);

  public readonly loginLoading = signal(false);
  public readonly loginError = signal<string | null>(null);
  private readonly _afterLoginPlace = signal(false);

  public readonly hasToken = computed(() => !!this._state.token());

  public readonly headerTitle = computed(() => {
    const u = this._url();
    if (u.includes('/shop')) return 'Shop';
    return 'Client';
  });

  public readonly loginForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
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
        this.loginOpen.set(false);
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

  public openLogin(placeAfter: boolean): void {
    this.loginError.set(null);
    this.loginOpen.set(true);
    this._afterLoginPlace.set(placeAfter);
  }

  public closeLogin(): void {
    this.loginOpen.set(false);
    this._afterLoginPlace.set(false);
  }

  public doLogin(): void {
    if (this.loginForm.invalid) return;

    const empresa_id = this.empresaId();
    if (!empresa_id) {
      this.loginError.set('empresa_required');
      return;
    }

    const v = this.loginForm.value;

    this.loginLoading.set(true);
    this.loginError.set(null);

    this._auth
      .login('client', {
        email: String(v.email || '').trim(),
        password: String(v.password || ''),
        empresa_id: Number(empresa_id)
      })
      .subscribe({
        next: (ok) => {
          this.loginLoading.set(false);
          if (!ok) {
            this.loginError.set('invalid_credentials');
            return;
          }
          this.loginOpen.set(false);

          if (this._afterLoginPlace()) {
            this._afterLoginPlace.set(false);
            this.placeOrder();
          }
        },
        error: (e: any) => {
          this.loginLoading.set(false);
          this.loginError.set(e?.error?.error ?? 'login_failed');
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
      this.openLogin(true);
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
          this.openLogin(true);
          return;
        }

        this.placeError.set(e?.error?.error ?? 'order_failed');
      }
    });
  }
}

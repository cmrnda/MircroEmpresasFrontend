import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientAuthApi } from './client-auth.api';

@Component({
  standalone: true,
  selector: 'app-client-register-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './register.page.html'
})
export class ClientRegisterPage {
  public readonly route = inject(ActivatedRoute);

  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _api = inject(ClientAuthApi);

  public readonly empresaId = signal<number | null>(null);

  public readonly nombre_razon = signal('');
  public readonly email = signal('');
  public readonly password = signal('');
  public readonly nit_ci = signal('');
  public readonly telefono = signal('');

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public ngOnInit(): void {
    this._route.parent?.parent?.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((pm) => {
      const n = Number(pm.get('empresa_id'));
      this.empresaId.set(Number.isFinite(n) && n > 0 ? n : null);
    });
  }

  public submit(): void {
    const empresa_id = this.empresaId();
    if (!empresa_id) return;

    this.loading.set(true);
    this.error.set(null);

    this._api
      .register(empresa_id, {
        nombre_razon: this.nombre_razon().trim(),
        email: this.email().trim(),
        password: this.password(),
        nit_ci: this.nit_ci().trim() || null,
        telefono: this.telefono().trim() || null
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('access_token', res.access_token);
          const redirect = String(this._route.snapshot.queryParamMap.get('redirect') || '');
          this.loading.set(false);
          if (redirect) {
            this._router.navigateByUrl(redirect);
          } else {
            this._router.navigate(['/shop', empresa_id, 'cart']);
          }
        },
        error: (e: any) => {
          this.error.set(e?.error?.error ?? 'register_failed');
          this.loading.set(false);
        }
      });
  }
}

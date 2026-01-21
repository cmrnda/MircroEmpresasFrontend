import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacade } from '../core/auth/auth.facade';
import { AuthType } from '../core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html'
})
export class LoginPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _auth = inject(AuthFacade);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly mode = signal<AuthType>('platform');

  public readonly title = computed(() => {
    const m = this.mode();
    if (m === 'platform') return 'Login plataforma';
    if (m === 'user') return 'Login tenant';
    return 'Login cliente';
  });

  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    empresa_id: [null as number | null]
  });

  public constructor() {
    this._route.paramMap.subscribe(params => {
      const m = (params.get('mode') || 'platform') as AuthType;

      if (m === 'platform' || m === 'user' || m === 'client') {
        this.mode.set(m);
      } else {
        this.mode.set('platform');
      }

      const empresaCtrl = this.form.get('empresa_id');

      if (this.mode() !== 'platform') {
        empresaCtrl?.setValidators([Validators.required]);
      } else {
        empresaCtrl?.clearValidators();
        empresaCtrl?.setValue(null);
      }

      empresaCtrl?.updateValueAndValidity();
      this.error.set(null);
    });
  }

  public submit(): void {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    const m = this.mode();
    const v = this.form.value;

    const payload: {
      email: string;
      password: string;
      empresa_id?: number;
    } = {
      email: String(v.email).trim(),
      password: String(v.password)
    };

    if (m !== 'platform') {
      payload.empresa_id = Number(v.empresa_id);
    }

    this._auth.login(m, payload).subscribe({
      next: ok => {
        this.loading.set(false);

        if (!ok) {
          this.error.set('credenciales invalidas o empresa incorrecta');
          return;
        }

        if (m === 'platform') this._router.navigate(['/platform']);
        else if (m === 'user') this._router.navigate(['/tenant']);
        else this._router.navigate(['/client']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('error de conexion con el servidor');
      }
    });
  }

  public go(m: AuthType): void {
    this._router.navigate(['/login', m]);
  }
}

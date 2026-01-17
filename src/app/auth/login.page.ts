import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthFacade} from '../core/auth/auth.facade';
import {AuthType} from '../core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-login-page',
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
    this._route.paramMap.subscribe(p => {
      const m = (p.get('mode') || 'platform') as AuthType;
      if (m !== 'platform' && m !== 'user' && m !== 'client') {
        this.mode.set('platform');
      } else {
        this.mode.set(m);
      }

      if (this.mode() === 'client') {
        this.form.get('empresa_id')?.setValidators([Validators.required]);
      } else {
        this.form.get('empresa_id')?.clearValidators();
      }
      this.form.get('empresa_id')?.updateValueAndValidity();
    });
  }

  public submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const m = this.mode();
    const v = this.form.value;

    const payload: any = {
      email: String(v.email || '').trim(),
      password: String(v.password || '')
    };

    if (m === 'client') payload.empresa_id = Number(v.empresa_id);
    if (m === 'user' && v.empresa_id) payload.empresa_id = Number(v.empresa_id);

    this._auth.login(m, payload).subscribe((ok: boolean) => {
      this.loading.set(false);
      if (!ok) {
        this.error.set('login_failed');
        return;
      }

      if (m === 'platform') this._router.navigate(['/platform']);
      else if (m === 'user') this._router.navigate(['/tenant']);
      else this._router.navigate(['/client']);
    });
  }

  public go(m: AuthType): void {
    this._router.navigate(['/login', m]);
  }
}

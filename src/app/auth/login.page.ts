import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacade } from '../core/auth/auth.facade';

export type AuthType = 'platform' | 'user';

// Captcha simple: suma (front-only)
type Captcha = { a: number; b: number; op: '+'; answer: number; text: string };
function newCaptcha(): Captcha {
  const a = Math.floor(Math.random() * 9) + 1; // 1..9
  const b = Math.floor(Math.random() * 9) + 1; // 1..9
  return { a, b, op: '+', answer: a + b, text: `${a} + ${b}` };
}

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

  public readonly title = computed(() =>
    this.mode() === 'platform' ? 'Login plataforma' : 'Login tenant'
  );

  // Password UI
  public readonly showPassword = signal(false);

  // Captcha
  public readonly captcha = signal<Captcha>(newCaptcha());
  public readonly captchaText = computed(() => this.captcha().text);

  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    empresa_id: [null as number | null],
    captcha_answer: [null as number | null, [Validators.required]]
  });

  public constructor() {
    this._route.paramMap.subscribe(params => {
      const m = params.get('mode') as AuthType | null;

      if (m === 'platform' || m === 'user') this.mode.set(m);
      else this.mode.set('platform');

      const empresaCtrl = this.form.get('empresa_id');

      if (this.mode() === 'user') {
        empresaCtrl?.setValidators([Validators.required]);
      } else {
        empresaCtrl?.clearValidators();
        empresaCtrl?.setValue(null);
      }

      empresaCtrl?.updateValueAndValidity();

      // reset captcha + ui state on mode change
      this.refreshCaptcha();
      this.showPassword.set(false);

      this.error.set(null);
    });
  }

  public go(m: AuthType): void {
    this._router.navigate(['/login', m]);
  }

  public togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  public refreshCaptcha(): void {
    this.captcha.set(newCaptcha());
    const c = this.form.get('captcha_answer');
    c?.setValue(null);
    c?.markAsPristine();
    c?.markAsUntouched();
    c?.updateValueAndValidity();
  }

  private captchaOk(): boolean {
    const v = Number(this.form.value.captcha_answer);
    return Number.isFinite(v) && v === this.captcha().answer;
  }

  public submit(): void {
    if (this.form.invalid || this.loading()) return;

    // validar captcha antes de llamar al backend
    if (!this.captchaOk()) {
      this.error.set('captcha incorrecto, intenta otra vez');
      this.refreshCaptcha();
      return;
    }

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

    if (m === 'user') {
      payload.empresa_id = Number(v.empresa_id);
    }

    this._auth.login(m, payload).subscribe({
      next: ok => {
        this.loading.set(false);

        if (!ok) {
          this.error.set('credenciales invalidas o empresa incorrecta');
          this.refreshCaptcha();
          return;
        }

        this._router.navigate([m === 'platform' ? '/platform' : '/tenant']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('error de conexion con el servidor');
        this.refreshCaptcha();
      }
    });
  }
}

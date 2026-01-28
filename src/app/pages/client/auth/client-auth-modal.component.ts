import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientAuthService } from './client-auth.service';

type Tab = 'login' | 'register';

@Component({
  standalone: true,
  selector: 'app-client-auth-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-auth-modal.component.html'
})
export class ClientAuthModalComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _auth = inject(ClientAuthService);

  @Input() public empresaId: number | null = null;
  @Input() public open: boolean = false;
  @Output() public openChange = new EventEmitter<boolean>();

  @Output() public authed = new EventEmitter<void>();

  public readonly tab = signal<Tab>('login');
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly canSubmit = computed(() => !this.loading() && !!this.empresaId);

  public readonly loginForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  public readonly registerForm = this._fb.group({
    nombre_razon: ['', [Validators.required, Validators.minLength(2)]],
    nit_ci: [''],
    telefono: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  public setTab(t: Tab): void {
    this.tab.set(t);
    this.error.set(null);
  }

  public close(): void {
    this.openChange.emit(false);
  }

  public stop(e: MouseEvent): void {
    e.stopPropagation();
  }

  public submit(): void {
    this.error.set(null);

    const empresa_id = Number(this.empresaId ?? 0);
    if (!Number.isFinite(empresa_id) || empresa_id <= 0) {
      this.error.set('empresa_required');
      return;
    }

    if (this.tab() === 'login') {
      this._submitLogin(empresa_id);
      return;
    }

    this._submitRegister(empresa_id);
  }

  private _submitLogin(empresa_id: number): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.error.set('invalid_form');
      return;
    }

    const v = this.loginForm.getRawValue();

    this.loading.set(true);
    this.error.set(null);

    this._auth.login(empresa_id, { email: String(v.email || ''), password: String(v.password || '') }).subscribe({
      next: (res) => {
        this._auth.setTokens(String(res.access_token || ''), String(res.refresh_token || ''));
        this.loading.set(false);
        this.authed.emit();
        this.close();
      },
      error: (e: any) => {
        this.loading.set(false);
        this.error.set(e?.error?.error ?? 'login_failed');
      }
    });
  }

  private _submitRegister(empresa_id: number): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error.set('invalid_form');
      return;
    }

    const v = this.registerForm.getRawValue();

    this.loading.set(true);
    this.error.set(null);

    this._auth
      .register(empresa_id, {
        nombre_razon: String(v.nombre_razon || ''),
        nit_ci: v.nit_ci,
        telefono: v.telefono,
        email: String(v.email || ''),
        password: String(v.password || '')
      })
      .subscribe({
        next: (res) => {
          this._auth.setTokens(String(res.access_token || ''), String(res.refresh_token || ''));
          this.loading.set(false);
          this.authed.emit();
          this.close();
        },
        error: (e: any) => {
          this.loading.set(false);
          this.error.set(e?.error?.error ?? 'register_failed');
        }
      });
  }

  public labelErr(code: string): string {
    switch (code) {
      case 'empresa_required':
        return 'Empresa requerida';
      case 'invalid_form':
        return 'Completa el formulario';
      case 'login_failed':
        return 'No se pudo iniciar sesion';
      case 'register_failed':
        return 'No se pudo registrar';
      default:
        return String(code || 'error');
    }
  }
}

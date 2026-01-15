import {Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AuthFacade} from '../core/auth/auth.facade';
import {AuthStateService} from '../core/auth/auth-state.service';

type LoginMode = 'platform' | 'tenant' | 'client';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.page.html'
})
export class LoginPage {
  public readonly selectedEmpresaId = signal<number | null>(null);
  public readonly showPassword = signal(false);
  public readonly submitted = signal(false);
  public readonly title = computed(() => {
    const m = this.mode();
    if (m === 'platform') return 'Acceso Plataforma';
    if (m === 'tenant') return 'Acceso Empresa';
    return 'Acceso Cliente';
  });
  public readonly subtitle = computed(() => {
    const m = this.mode();
    if (m === 'platform') return 'Administracion de tenants y configuracion global';
    if (m === 'tenant') return 'Gestion interna de la empresa';
    return 'Portal del cliente';
  });
  private readonly _fb = inject(FormBuilder);
  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  private readonly _route = inject(ActivatedRoute);
  public readonly mode = computed(() => (this._route.snapshot.paramMap.get('mode') as LoginMode) || 'platform');
  private readonly _router = inject(Router);
  private readonly _auth = inject(AuthFacade);
  public readonly loading = this._auth.loading;
  public readonly error = this._auth.error;
  public readonly tenantsNeeded = this._auth.tenantsNeeded;
  private readonly _state = inject(AuthStateService);

  public submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const email = this.form.value.email!;
    const password = this.form.value.password!;
    const empresaId = this.selectedEmpresaId() ?? undefined;

    this._auth.login(this.mode(), email, password, empresaId).subscribe(res => {
      if (!res) return;

      const type = this._state.claims()?.type;
      if (type === 'platform') this._router.navigateByUrl('/platform/tenants');
      else if (type === 'user') this._router.navigateByUrl('/tenant/users');
      else this._router.navigateByUrl('/client/home');
    });
  }

  public onEmpresaChange(v: string): void {
    this.selectedEmpresaId.set(v ? Number(v) : null);
  }

  public togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  public isInvalid(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return (this.submitted() || c.touched) && c.invalid;
  }

  public getError(name: 'email' | 'password'): string | null {
    const c = this.form.controls[name];
    if (!((this.submitted() || c.touched) && c.invalid)) return null;
    if (c.errors?.['required']) return 'Este campo es obligatorio';
    if (c.errors?.['email']) return 'Correo invalido';
    return 'Campo invalido';
  }
}

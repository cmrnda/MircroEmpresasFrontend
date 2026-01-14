import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFacade } from '../core/auth/auth.facade';
import { AuthStateService } from '../core/auth/auth-state.service';

type LoginMode = 'platform' | 'tenant' | 'client';

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
  private readonly _state = inject(AuthStateService);

  public readonly mode = computed(() => (this._route.snapshot.paramMap.get('mode') as LoginMode) || 'platform');

  public readonly loading = this._auth.loading;
  public readonly error = this._auth.error;
  public readonly tenantsNeeded = this._auth.tenantsNeeded;

  public readonly selectedEmpresaId = signal<number | null>(null);

  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  public submit(): void {
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
}

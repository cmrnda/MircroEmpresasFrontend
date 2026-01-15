import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TenantUser, UsersApi} from './users.api';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.page.html'
})
export class UsersPage {
  public readonly items = signal<TenantUser[]>([]);
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly tempPassword = signal<string | null>(null);
  private readonly _api = inject(UsersApi);
  private readonly _fb = inject(FormBuilder);
  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    roles: ['SELLER', [Validators.required]]
  });

  public constructor() {
    this.load();
  }

  public load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);

    this._api.list().subscribe({
      next: (list) => {
        this.items.set(list ?? []);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'load_failed');
        this.loading.set(false);
      }
    });
  }

  public create(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);

    const v = this.form.value;
    const roles = String(v.roles || '')
      .split(',')
      .map(x => x.trim())
      .filter(x => !!x);

    this._api.create({
      email: v.email!,
      password: v.password!,
      roles
    }).subscribe({
      next: () => {
        this.form.reset({roles: 'SELLER'});
        this.load();
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'create_failed');
        this.loading.set(false);
      }
    });
  }

  public toggle(u: TenantUser): void {
    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);

    this._api.update(u.usuario_id, {tenant_activo: !u.tenant_activo}).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error.set(e?.error?.error ?? 'update_failed');
        this.loading.set(false);
      }
    });
  }

  public reset(u: TenantUser): void {
    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);

    this._api.resetPassword(u.usuario_id).subscribe({
      next: (res) => {
        const p = res?.temp_password ?? null;
        this.tempPassword.set(p);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'reset_failed');
        this.loading.set(false);
      }
    });
  }

  public remove(u: TenantUser): void {
    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);

    this._api.remove(u.usuario_id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error.set(e?.error?.error ?? 'delete_failed');
        this.loading.set(false);
      }
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersApi, TenantUser } from './users.api';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div style="max-width:1000px;margin:24px auto;padding:16px;">
    <h2>Tenant users</h2>

    <form [formGroup]="form" (ngSubmit)="create()" style="display:flex;gap:8px;flex-wrap:wrap;">
      <input formControlName="email" placeholder="email" />
      <input formControlName="password" placeholder="password" type="password" />
      <input formControlName="roles" placeholder="roles (SELLER,INVENTORY)" />
      <button type="submit" [disabled]="loading()">create</button>
    </form>

    <div *ngIf="error()" style="color:#ff6b6b;margin-top:8px;">error: {{ error() }}</div>

    <div style="margin-top:12px;">
      <button (click)="load()" [disabled]="loading()">reload</button>
    </div>

    <table style="width:100%;margin-top:12px;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #333;">id</th>
          <th style="text-align:left;border-bottom:1px solid #333;">email</th>
          <th style="text-align:left;border-bottom:1px solid #333;">tenant_active</th>
          <th style="text-align:left;border-bottom:1px solid #333;">roles</th>
          <th style="text-align:left;border-bottom:1px solid #333;">actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of items()">
          <td style="padding:8px 0;">{{ u.usuario_id }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.tenant_activo }}</td>
          <td>{{ u.roles.join(',') }}</td>
          <td style="display:flex;gap:8px;flex-wrap:wrap;padding:8px 0;">
            <button (click)="toggle(u)" [disabled]="loading()">toggle</button>
            <button (click)="reset(u)" [disabled]="loading()">reset</button>
            <button (click)="remove(u)" [disabled]="loading()">delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div *ngIf="tempPassword()" style="margin-top:12px;border:1px solid #333;padding:12px;border-radius:10px;">
      temp_password: <b>{{ tempPassword() }}</b>
    </div>
  </div>
  `
})
export class UsersPage {
  private readonly _api = inject(UsersApi);
  private readonly _fb = inject(FormBuilder);

  public readonly items = signal<TenantUser[]>([]);
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly tempPassword = signal<string | null>(null);

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
        this.form.reset({ roles: 'SELLER' });
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

    this._api.update(u.usuario_id, { tenant_activo: !u.tenant_activo }).subscribe({
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

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientsApi, TenantClient } from './clients.api';

@Component({
  standalone: true,
  selector: 'app-clients-page',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div style="max-width:1000px;margin:24px auto;padding:16px;">
    <h2>Tenant clients</h2>

    <form [formGroup]="form" (ngSubmit)="create()" style="display:flex;gap:8px;flex-wrap:wrap;">
      <input formControlName="email" placeholder="email" />
      <input formControlName="password" placeholder="password" type="password" />
      <input formControlName="nombre_razon" placeholder="nombre_razon" />
      <input formControlName="nit_ci" placeholder="nit_ci" />
      <input formControlName="telefono" placeholder="telefono" />
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
          <th style="text-align:left;border-bottom:1px solid #333;">nombre</th>
          <th style="text-align:left;border-bottom:1px solid #333;">active</th>
          <th style="text-align:left;border-bottom:1px solid #333;">actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of items()">
          <td style="padding:8px 0;">{{ c.cliente_id }}</td>
          <td>{{ c.email }}</td>
          <td>{{ c.nombre_razon }}</td>
          <td>{{ c.activo }}</td>
          <td style="display:flex;gap:8px;flex-wrap:wrap;padding:8px 0;">
            <button (click)="toggle(c)" [disabled]="loading()">toggle</button>
            <button (click)="remove(c)" [disabled]="loading()">delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  `
})
export class ClientsPage {
  private readonly _api = inject(ClientsApi);
  private readonly _fb = inject(FormBuilder);

  public readonly items = signal<TenantClient[]>([]);
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    nombre_razon: ['', [Validators.required]],
    nit_ci: [''],
    telefono: ['']
  });

  public constructor() {
    this.load();
  }

  public load(): void {
    this.loading.set(true);
    this.error.set(null);

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

    const v = this.form.value;

    this._api.create({
      email: v.email!,
      password: v.password!,
      nombre_razon: v.nombre_razon!,
      nit_ci: v.nit_ci || null,
      telefono: v.telefono || null
    }).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'create_failed');
        this.loading.set(false);
      }
    });
  }

  public toggle(c: TenantClient): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.update(c.cliente_id, { activo: !c.activo }).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error.set(e?.error?.error ?? 'update_failed');
        this.loading.set(false);
      }
    });
  }

  public remove(c: TenantClient): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.remove(c.cliente_id).subscribe({
      next: () => this.load(),
      error: (e) => {
        this.error.set(e?.error?.error ?? 'delete_failed');
        this.loading.set(false);
      }
    });
  }
}

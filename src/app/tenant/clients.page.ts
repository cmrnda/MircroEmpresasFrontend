import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientsApi, TenantClient } from './clients.api';

@Component({
  standalone: true,
  selector: 'app-clients-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.page.html'
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

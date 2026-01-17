import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientsFacade } from './clients.facade';
import { TenantClient } from './clients.api';

@Component({
  standalone: true,
  selector: 'app-clients-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.page.html'
})
export class TenantClientsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(ClientsFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly clients = this._facade.clients;

  public readonly includeInactivos = signal(false);
  public readonly filterText = signal('');

  public readonly editOpen = signal(false);
  public readonly editing = signal<TenantClient | null>(null);

  public readonly filteredClients = computed(() => {
    const q = (this.filterText() || '').trim().toLowerCase();
    const list = this.clients();
    if (!q) return list;

    return list.filter(c => {
      const id = String(c.cliente_id);
      const email = (c.email || '').toLowerCase();
      const nombre = (c.nombre_razon || '').toLowerCase();
      const nit = (c.nit_ci || '').toLowerCase();
      const tel = (c.telefono || '').toLowerCase();
      return id.includes(q) || email.includes(q) || nombre.includes(q) || nit.includes(q) || tel.includes(q);
    });
  });

  public readonly createForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    nombre_razon: ['', [Validators.required]],
    nit_ci: [''],
    telefono: ['']
  });

  public readonly editForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    nombre_razon: ['', [Validators.required]],
    nit_ci: [''],
    telefono: ['']
  });

  public constructor() {
    this.reload();
  }

  public reload(): void {
    this._facade.load(this.includeInactivos()).subscribe();
  }

  public toggleInclude(): void {
    this.includeInactivos.set(!this.includeInactivos());
    this.reload();
  }

  public clearSearch(): void {
    this.filterText.set('');
  }

  public create(): void {
    if (this.createForm.invalid) return;
    const v = this.createForm.value;

    this._facade.create({
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      nombre_razon: String(v.nombre_razon || '').trim(),
      nit_ci: (v.nit_ci || '').trim() || null,
      telefono: (v.telefono || '').trim() || null
    }).subscribe(res => {
      if (!res) return;
      this.createForm.reset();
      this.reload();
    });
  }

  public openEdit(c: TenantClient): void {
    if (!c.activo) return;
    this.editing.set(c);
    this.editForm.patchValue({
      email: c.email,
      password: '',
      nombre_razon: c.nombre_razon,
      nit_ci: c.nit_ci ?? '',
      telefono: c.telefono ?? ''
    });
    this.editOpen.set(true);
  }

  public closeEdit(): void {
    this.editOpen.set(false);
    this.editing.set(null);
  }

  public saveEdit(): void {
    const c = this.editing();
    if (!c || this.editForm.invalid) return;
    const v = this.editForm.value;

    const payload: any = {
      email: String(v.email || '').trim(),
      nombre_razon: String(v.nombre_razon || '').trim(),
      nit_ci: (v.nit_ci || '').trim() || null,
      telefono: (v.telefono || '').trim() || null
    };

    const pass = String(v.password || '');
    if (pass) payload.password = pass;

    this._facade.update(c.cliente_id, payload).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }

  public remove(c: TenantClient): void {
    this._facade.remove(c.cliente_id).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public restore(c: TenantClient): void {
    this._facade.restore(c.cliente_id).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public statusBadgeClass(activo: boolean): string {
    return activo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }
}

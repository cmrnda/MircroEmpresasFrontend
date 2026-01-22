import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantClientsFacade } from './tenant-clients.facade';
import { TenantClient } from './tenant-clients.api';

@Component({
  standalone: true,
  selector: 'app-tenant-clients-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tenant-clients.page.html'
})
export class TenantClientsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantClientsFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly includeInactivos = signal(false);
  public readonly filterQ = signal('');

  public readonly editOpen = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly filtered = computed(() => this.items());

  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    nombre_razon: ['', [Validators.required]],
    nit_ci: [''],
    telefono: ['']
  });

  public readonly editForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    nombre_razon: ['', [Validators.required]],
    nit_ci: [''],
    telefono: ['']
  });

  public constructor() {
    this.reload();
  }

  public reload(): void {
    const q = (this.filterQ() || '').trim() || undefined;
    this._facade.load({ q, includeInactivos: this.includeInactivos() }).subscribe();
  }

  public create(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    this._facade.create({
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      nombre_razon: String(v.nombre_razon || '').trim(),
      nit_ci: String(v.nit_ci || '').trim() ? String(v.nit_ci) : null,
      telefono: String(v.telefono || '').trim() ? String(v.telefono) : null
    }).subscribe(res => {
      if (!res) return;
      this.form.reset({ email: '', password: '', nombre_razon: '', nit_ci: '', telefono: '' });
      this.reload();
    });
  }

  public openEdit(row: TenantClient): void {
    this.editingId.set(row.cliente_id);

    this.editForm.patchValue({
      email: row.email,
      nombre_razon: row.nombre_razon,
      nit_ci: row.nit_ci ?? '',
      telefono: row.telefono ?? ''
    });

    this.editOpen.set(true);
  }

  public closeEdit(): void {
    this.editOpen.set(false);
    this.editingId.set(null);
  }

  public saveEdit(): void {
    const id = this.editingId();
    if (!id || this.editForm.invalid) return;

    const v = this.editForm.value;

    this._facade.update(id, {
      email: String(v.email || '').trim(),
      nombre_razon: String(v.nombre_razon || '').trim(),
      nit_ci: String(v.nit_ci || '').trim() ? String(v.nit_ci) : null,
      telefono: String(v.telefono || '').trim() ? String(v.telefono) : null
    }).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }

  public unlink(id: number): void {
    this._facade.unlink(id).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public restoreLink(id: number): void {
    this._facade.restoreLink(id).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public badgeClass(activo: boolean): string {
    return activo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }

  public linkBadgeClass(linkActivo: boolean): string {
    return linkActivo ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600';
  }

  public isLinked(row: TenantClient): boolean {
    if (row.link_activo === undefined || row.link_activo === null) return !!row.activo;
    return !!row.link_activo;
  }
}

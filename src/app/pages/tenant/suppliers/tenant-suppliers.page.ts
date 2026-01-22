import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantSuppliersFacade } from './tenant-suppliers.facade';
import { TenantSupplier } from './tenant-suppliers.api';

@Component({
  standalone: true,
  selector: 'app-tenant-suppliers-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tenant-suppliers.page.html'
})
export class TenantSuppliersPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantSuppliersFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly includeInactivos = signal(false);
  public readonly filterQ = signal('');

  public readonly editOpen = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly filtered = computed(() => this.items());

  public readonly form = this._fb.group({
    nombre: ['', [Validators.required]],
    nit: [''],
    telefono: [''],
    direccion: [''],
    email: ['']
  });

  public readonly editForm = this._fb.group({
    nombre: ['', [Validators.required]],
    nit: [''],
    telefono: [''],
    direccion: [''],
    email: [''],
    activo: [true, [Validators.required]]
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
      nombre: String(v.nombre || '').trim(),
      nit: (String(v.nit || '').trim() || null),
      telefono: (String(v.telefono || '').trim() || null),
      direccion: (String(v.direccion || '').trim() || null),
      email: (String(v.email || '').trim() || null)
    }).subscribe(res => {
      if (!res) return;
      this.form.reset({ nombre: '', nit: '', telefono: '', direccion: '', email: '' });
      this.reload();
    });
  }

  public openEdit(row: TenantSupplier): void {
    this.editingId.set(row.proveedor_id);
    this.editForm.patchValue({
      nombre: row.nombre,
      nit: row.nit ?? '',
      telefono: row.telefono ?? '',
      direccion: row.direccion ?? '',
      email: row.email ?? '',
      activo: !!row.activo
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
      nombre: String(v.nombre || '').trim(),
      nit: (String(v.nit || '').trim() || null),
      telefono: (String(v.telefono || '').trim() || null),
      direccion: (String(v.direccion || '').trim() || null),
      email: (String(v.email || '').trim() || null),
      activo: !!v.activo
    }).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }

  public remove(id: number): void {
    this._facade.remove(id).subscribe(() => this.reload());
  }

  public restore(id: number): void {
    this._facade.restore(id).subscribe(() => this.reload());
  }

  public badgeClass(activo: boolean): string {
    return activo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }
}

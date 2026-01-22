import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantCategoriesFacade } from './tenant-categories.facade';
import { TenantCategory } from './tenant-categories.api';

@Component({
  standalone: true,
  selector: 'app-tenant-categories-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tenant-categories.page.html'
})
export class TenantCategoriesPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantCategoriesFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly includeInactivos = signal(false);
  public readonly filterQ = signal('');

  public readonly editOpen = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly filtered = computed(() => {
    const q = (this.filterQ() || '').trim().toLowerCase();
    const all = this.items() ?? [];
    if (!q) return all;
    return all.filter(x => String(x.nombre || '').toLowerCase().includes(q));
  });

  public readonly form = this._fb.group({
    nombre: ['', [Validators.required]]
  });

  public readonly editForm = this._fb.group({
    nombre: ['', [Validators.required]],
    activo: [true, [Validators.required]]
  });

  public constructor() {
    this.reload();
  }

  public reload(): void {
    const q = (this.filterQ() || '').trim() || undefined;

    this._facade.load({
      q,
      includeInactivos: this.includeInactivos()
    }).subscribe();
  }

  public create(): void {
    if (this.form.invalid) return;

    const v = this.form.value;
    const payload = { nombre: String(v.nombre || '').trim() };

    this._facade.create(payload).subscribe(res => {
      if (!res) return;
      this.form.reset();
      this.reload();
    });
  }

  public openEdit(row: TenantCategory): void {
    this.editingId.set(row.categoria_id);
    this.editForm.patchValue({
      nombre: row.nombre,
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

    const payload = {
      nombre: String(v.nombre || '').trim(),
      activo: !!v.activo
    };

    this._facade.update(id, payload).subscribe(res => {
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

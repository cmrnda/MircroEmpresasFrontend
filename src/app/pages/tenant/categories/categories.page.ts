import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TenantCategoriesFacade} from './tenant-categories.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-categories-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.page.html'
})
export class TenantCategoriesPage {
  private readonly _fb = inject(FormBuilder);
  public readonly vm = inject(TenantCategoriesFacade);

  public readonly editId = signal<number | null>(null);

  public readonly form = this._fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]]
  });

  public readonly editForm = this._fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    activo: [true]
  });

  public ngOnInit(): void {
    this.vm.load();
  }

  public startEdit(id: number, nombre: string, activo: boolean): void {
    this.editId.set(id);
    this.editForm.setValue({nombre: nombre || '', activo: !!activo});
  }

  public cancelEdit(): void {
    this.editId.set(null);
  }

  public submitCreate(): void {
    if (this.form.invalid) return;
    const nombre = String(this.form.value.nombre || '');
    this.vm.create(nombre);
    this.form.reset();
  }

  public submitEdit(): void {
    const id = this.editId();
    if (!id) return;
    if (this.editForm.invalid) return;

    const nombre = String(this.editForm.value.nombre || '');
    const activo = !!this.editForm.value.activo;

    this.vm.update(id, {nombre, activo});
    this.editId.set(null);
  }
}

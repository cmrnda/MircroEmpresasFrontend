import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TenantProductsFacade } from './tenant-products.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-products-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.page.html'
})
export class TenantProductsPage {
  private readonly _fb = inject(FormBuilder);
  public readonly vm = inject(TenantProductsFacade);

  public readonly editId = signal<number | null>(null);

  public readonly form = this._fb.group({
    categoria_id: [null as number | null, [Validators.required]],
    codigo: ['', [Validators.required, Validators.minLength(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
    precio: [0, [Validators.required]],
    stock_min: [0, [Validators.required]]
  });

  public readonly editForm = this._fb.group({
    categoria_id: [null as number | null, [Validators.required]],
    codigo: ['', [Validators.required, Validators.minLength(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
    precio: [0, [Validators.required]],
    stock_min: [0, [Validators.required]],
    activo: [true]
  });

  public ngOnInit(): void {
    this.vm.loadCategories();
    this.vm.load();
  }

  public submitCreate(): void {
    if (this.form.invalid) return;
    const v = this.form.value;

    this.vm.create({
      categoria_id: Number(v.categoria_id),
      codigo: String(v.codigo || '').trim(),
      descripcion: String(v.descripcion || '').trim(),
      precio: Number(v.precio || 0),
      stock_min: Number(v.stock_min || 0)
    });

    this.form.reset({ categoria_id: null, codigo: '', descripcion: '', precio: 0, stock_min: 0 });
  }

  public startEdit(p: any): void {
    this.editId.set(Number(p.producto_id));
    this.editForm.setValue({
      categoria_id: Number(p.categoria_id),
      codigo: String(p.codigo || ''),
      descripcion: String(p.descripcion || ''),
      precio: Number(p.precio || 0),
      stock_min: Number(p.stock_min || 0),
      activo: !!p.activo
    });
  }

  public cancelEdit(): void {
    this.editId.set(null);
  }

  public submitEdit(): void {
    const id = this.editId();
    if (!id) return;
    if (this.editForm.invalid) return;

    const v = this.editForm.value;

    this.vm.update(id, {
      categoria_id: Number(v.categoria_id),
      codigo: String(v.codigo || '').trim(),
      descripcion: String(v.descripcion || '').trim(),
      precio: Number(v.precio || 0),
      stock_min: Number(v.stock_min || 0),
      activo: !!v.activo
    });

    this.editId.set(null);
  }

  public onSearchChange(v: string): void {
    this.vm.setFilterQ(v);
  }

  public applySearch(): void {
    this.vm.applySearch();
  }

  public onCategoriaFilter(v: string): void {
    const id = v ? Number(v) : null;
    this.vm.setFilterCategoria(id);
  }

  public onOpenImages(producto_id: number): void {
    this.vm.openImages(producto_id);
  }

  public onUploadImage(ev: Event, is_primary: boolean): void {
    const input = ev.target as HTMLInputElement | null;
    const f = input?.files?.[0] || null;
    if (!f) return;
    this.vm.uploadImage(f, is_primary);
    if (input) input.value = '';
  }
}

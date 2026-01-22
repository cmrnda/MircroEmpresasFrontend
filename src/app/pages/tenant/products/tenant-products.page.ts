import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantProductsFacade } from './tenant-products.facade';
import { TenantProduct } from './tenant-products.api';
import { TenantCategoriesApi, TenantCategory } from '../categories/tenant-categories.api';
import { TenantProductImageFacade } from './tenant-product-image.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-products-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tenant-products.page.html'
})
export class TenantProductsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantProductsFacade);
  private readonly _catsApi = inject(TenantCategoriesApi);
  private readonly _img = inject(TenantProductImageFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly categories = signal<TenantCategory[]>([]);

  public readonly includeInactivos = signal(false);
  public readonly filterQ = signal('');
  public readonly filterCategoriaId = signal<number | null>(null);

  public readonly editOpen = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly imageOpen = signal(false);
  public readonly imageProductoId = signal<number | null>(null);
  public readonly imageLoading = this._img.loading;
  public readonly imageError = this._img.error;
  public readonly imageCurrent = this._img.current;

  public readonly filtered = computed(() => this.items());

  public readonly form = this._fb.group({
    categoria_id: [null as number | null, [Validators.required]],
    codigo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    precio: [0 as number | null],
    stock: [0 as number | null],
    stock_min: [0 as number | null]
  });

  public readonly editForm = this._fb.group({
    categoria_id: [null as number | null, [Validators.required]],
    codigo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    precio: [0 as number | null],
    stock: [0 as number | null],
    stock_min: [0 as number | null],
    activo: [true, [Validators.required]]
  });

  public readonly imageForm = this._fb.group({
    url: ['', [Validators.required]],
    file_path: ['', [Validators.required]],
    mime_type: ['image/png', [Validators.required]]
  });

  public constructor() {
    this._catsApi.list({ includeInactivos: true }).subscribe(res => {
      this.categories.set(res.items ?? []);
    });

    this.reload();
  }

  public reload(): void {
    const q = (this.filterQ() || '').trim() || undefined;
    const categoriaId = this.filterCategoriaId() ?? undefined;

    this._facade.load({
      q,
      categoriaId: categoriaId ?? undefined,
      includeInactivos: this.includeInactivos()
    }).subscribe();
  }

  public create(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    this._facade.create({
      categoria_id: Number(v.categoria_id),
      codigo: String(v.codigo || '').trim(),
      descripcion: String(v.descripcion || '').trim(),
      precio: this._toNumberOrZero(v.precio),
      stock: this._toNumberOrZero(v.stock),
      stock_min: this._toIntOrZero(v.stock_min)
    }).subscribe(res => {
      if (!res) return;
      this.form.reset({ categoria_id: null, codigo: '', descripcion: '', precio: 0, stock: 0, stock_min: 0 });
      this.reload();
    });
  }

  public openEdit(row: TenantProduct): void {
    this.editingId.set(row.producto_id);

    this.editForm.patchValue({
      categoria_id: row.categoria_id,
      codigo: row.codigo,
      descripcion: row.descripcion,
      precio: row.precio ?? 0,
      stock: row.stock ?? 0,
      stock_min: row.stock_min ?? 0,
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
      categoria_id: Number(v.categoria_id),
      codigo: String(v.codigo || '').trim(),
      descripcion: String(v.descripcion || '').trim(),
      precio: this._toNumberOrZero(v.precio),
      stock: this._toNumberOrZero(v.stock),
      stock_min: this._toIntOrZero(v.stock_min),
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

  public openImage(row: TenantProduct): void {
    this.imageProductoId.set(row.producto_id);
    this.imageForm.reset({ url: '', file_path: '', mime_type: 'image/png' });
    if (row.primary_image_url) {
      this.imageForm.patchValue({ url: row.primary_image_url ?? '' });
    }

    this.imageOpen.set(true);

    this._img.load(row.producto_id).subscribe(res => {
      if (!res) return;
      this.imageForm.patchValue({
        url: res.url ?? '',
        file_path: res.file_path ?? '',
        mime_type: res.mime_type ?? 'image/png'
      });
    });
  }

  public closeImage(): void {
    this.imageOpen.set(false);
    this.imageProductoId.set(null);
    this._img.clear();
  }

  public saveImage(): void {
    const pid = this.imageProductoId();
    if (!pid || this.imageForm.invalid) return;

    const v = this.imageForm.value;

    this._img.set(pid, {
      url: String(v.url || '').trim(),
      file_path: String(v.file_path || '').trim(),
      mime_type: String(v.mime_type || '').trim()
    }).subscribe(res => {
      if (!res) return;
      this.closeImage();
      this.reload();
    });
  }

  public removeImage(): void {
    const pid = this.imageProductoId();
    if (!pid) return;

    this._img.remove(pid).subscribe(res => {
      if (!res) return;
      this.closeImage();
      this.reload();
    });
  }

  public badgeClass(activo: boolean): string {
    return activo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }

  public catName(categoriaId: number): string {
    const c = (this.categories() ?? []).find(x => Number(x.categoria_id) === Number(categoriaId));
    return c?.nombre ? String(c.nombre) : `#${categoriaId}`;
  }

  private _toNumberOrZero(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private _toIntOrZero(v: unknown): number {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.trunc(n);
  }
}

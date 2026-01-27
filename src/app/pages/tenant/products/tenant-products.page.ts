import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, take, tap } from 'rxjs';

import { TenantProduct, UpdateTenantProductRequest } from './tenant-products.api';
import { TenantProductsFacade } from './tenant-products.facade';

import { ProductsCreateCardComponent, ProductCreatePayload } from './components/products-create-card/products-create-card.component';
import { ProductsTableComponent } from './components/products-table/products-table.component';

export type Category = { categoria_id: number; nombre: string };

@Component({
  standalone: true,
  selector: 'app-tenant-products-page',
  imports: [CommonModule, ReactiveFormsModule, ProductsCreateCardComponent, ProductsTableComponent],
  templateUrl: './tenant-products.page.html'
})
export class TenantProductsPage {
  private readonly _fb = inject(FormBuilder);
  public readonly vm = inject(TenantProductsFacade);

  public readonly categories = signal<Category[]>([]);

  public readonly filterCategoriaId = signal<number | null>(null);
  public readonly filterQ = signal('');
  public readonly includeInactivos = signal(false);

  public readonly products = computed(() => this.vm.items());

  public readonly totalCount = computed(() => this.products().length);
  public readonly activeCount = computed(() => this.products().filter(x => x.activo).length);
  public readonly inactiveCount = computed(() => this.products().filter(x => !x.activo).length);

  public readonly filtered = computed(() => {
    const q = this.filterQ().trim().toLowerCase();
    const cat = this.filterCategoriaId();
    const inc = this.includeInactivos();

    return this.products().filter(p => {
      if (!inc && !p.activo) return false;
      if (cat != null && p.categoria_id !== cat) return false;
      if (!q) return true;

      const a = (p.codigo || '').toLowerCase();
      const b = (p.descripcion || '').toLowerCase();
      return a.includes(q) || b.includes(q);
    });
  });

  public readonly createOpen = signal(false);

  public readonly editOpen = signal(false);
  public readonly imageOpen = signal(false);
  public readonly selected = signal<TenantProduct | null>(null);

  public readonly editForm = this._fb.group({
    categoria_id: [null as number | null, [Validators.required]],
    codigo: ['', [Validators.required, Validators.maxLength(60)]],
    descripcion: ['', [Validators.required, Validators.maxLength(160)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    stock_min: [0, [Validators.required, Validators.min(0)]],
    activo: [true, [Validators.required]]
  });

  public readonly imageForm = this._fb.group({
    image_url: ['' as string | null]
  });

  public readonly imageError = signal<string | null>(null);

  public constructor() {
    effect(() => {
      this.reload();
    });
  }

  public loading(): boolean {
    return this.vm.loading();
  }

  public error(): string | null {
    return this.vm.error();
  }

  public reload(): void {
    const categoriaId = this.filterCategoriaId();
    const q = this.filterQ().trim();
    const includeInactivos = this.includeInactivos();

    this.vm
      .load({
        q: q ? q : undefined,
        categoriaId: categoriaId ?? undefined,
        includeInactivos: includeInactivos ? true : undefined
      })
      .pipe(take(1))
      .subscribe();
  }

  public openCreate(): void {
    this.createOpen.set(true);
  }

  public closeCreate(): void {
    this.createOpen.set(false);
  }

  public onCreate(payload: ProductCreatePayload): void {
    this.vm
      .create(payload)
      .pipe(
        take(1),
        tap(res => {
          if (res) {
            this.closeCreate();
            this.reload();
          }
        })
      )
      .subscribe();
  }

  public openEdit(p: TenantProduct): void {
    this.selected.set(p);
    this.editForm.reset(
      {
        categoria_id: p.categoria_id,
        codigo: p.codigo,
        descripcion: p.descripcion,
        precio: Number(p.precio || 0),
        stock: Number(p.stock || 0),
        stock_min: Number(p.stock_min || 0),
        activo: !!p.activo
      },
      { emitEvent: false }
    );
    this.editOpen.set(true);
  }

  public closeEdit(): void {
    this.editOpen.set(false);
    this.selected.set(null);
  }

  public saveEdit(): void {
    const p = this.selected();
    if (!p) return;
    if (this.vm.loading() || this.editForm.invalid) return;

    const v = this.editForm.getRawValue();

    const body: UpdateTenantProductRequest = {
      categoria_id: Number(v.categoria_id),
      codigo: String(v.codigo || '').trim(),
      descripcion: String(v.descripcion || '').trim(),
      precio: Number(v.precio || 0),
      stock: Number(v.stock || 0),
      stock_min: Number(v.stock_min || 0),
      activo: !!v.activo
    };

    this.vm
      .update(p.producto_id, body)
      .pipe(
        take(1),
        tap(res => {
          if (res) {
            this.closeEdit();
            this.reload();
          }
        })
      )
      .subscribe();
  }

  public openImage(p: TenantProduct): void {
    this.selected.set(p);
    this.imageForm.reset({ image_url: p.image_url ?? '' }, { emitEvent: false });
    this.imageError.set(null);
    this.imageOpen.set(true);
  }

  public closeImage(): void {
    this.imageOpen.set(false);
    this.selected.set(null);
    this.imageError.set(null);
  }

  public saveImage(): void {
    const p = this.selected();
    if (!p) return;
    if (this.vm.loading()) return;

    const v = this.imageForm.getRawValue();
    const url = String(v.image_url || '').trim();

    this.vm
      .update(p.producto_id, { image_url: url ? url : null })
      .pipe(
        take(1),
        tap(res => {
          if (res) {
            this.closeImage();
            this.reload();
          }
        }),
        catchError(err => {
          this.imageError.set(err?.error?.error ?? 'image_update_failed');
          return of(null);
        })
      )
      .subscribe();
  }

  public removeImage(): void {
    const p = this.selected();
    if (!p) return;

    this.vm
      .update(p.producto_id, { image_url: null })
      .pipe(
        take(1),
        tap(res => {
          if (res) {
            this.closeImage();
            this.reload();
          }
        }),
        catchError(err => {
          this.imageError.set(err?.error?.error ?? 'image_remove_failed');
          return of(null);
        })
      )
      .subscribe();
  }

  public remove(producto_id: number): void {
    this.vm
      .remove(producto_id)
      .pipe(
        take(1),
        tap(res => {
          if (res) this.reload();
        })
      )
      .subscribe();
  }

  public restore(producto_id: number): void {
    this.vm
      .restore(producto_id)
      .pipe(
        take(1),
        tap(res => {
          if (res) this.reload();
        })
      )
      .subscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantSuppliersFacade } from './tenant-suppliers.facade';
import { TenantSupplier, TenantSuppliersApi } from './tenant-suppliers.api';
import { TenantProductsApi, TenantProduct } from '../products/tenant-products.api';

@Component({
  standalone: true,
  selector: 'app-tenant-suppliers-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tenant-suppliers.page.html'
})
export class TenantSuppliersPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantSuppliersFacade);

  // 🔥 APIs extra para el feature de vincular productos
  private readonly _supApi = inject(TenantSuppliersApi);
  private readonly _prodApi = inject(TenantProductsApi);

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

  // =========================
  // ✅ NUEVO: “Productos” por proveedor (detalle + modal link)
  // =========================
  public readonly detailOpen = signal(false);
  public readonly detailSupplier = signal<TenantSupplier | null>(null);

  public readonly linkedLoading = signal(false);
  public readonly linkedError = signal<string | null>(null);
  public readonly linkedItems = signal<TenantProduct[]>([]);

  public readonly linkModalOpen = signal(false);
  public readonly linkModalLoading = signal(false);
  public readonly linkModalError = signal<string | null>(null);

  public readonly allProducts = signal<TenantProduct[]>([]);
  public readonly linkQ = signal('');
  public readonly selectedIds = signal<Set<number>>(new Set<number>());

  public readonly filteredAllProducts = computed(() => {
    const text = (this.linkQ() || '').trim().toLowerCase();
    const rows = this.allProducts() ?? [];
    if (!text) return rows.slice(0, 120);

    return rows
      .filter(p => {
        const code = String((p as any).codigo ?? '').toLowerCase();
        const desc = String((p as any).descripcion ?? '').toLowerCase();
        return code.includes(text) || desc.includes(text);
      })
      .slice(0, 120);
  });

  public constructor() {
    this.reload();
  }

  // =========================
  // CRUD proveedores (lo tuyo)
  // =========================
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

  // =========================
  // ✅ NUEVO: detalle proveedor + productos vinculados
  // =========================
  public openDetail(s: TenantSupplier): void {
    this.detailSupplier.set(s);
    this.detailOpen.set(true);
    this.loadLinkedProducts();
  }

  public closeDetail(): void {
    this.detailOpen.set(false);
    this.detailSupplier.set(null);
    this.linkedItems.set([]);
    this.linkedError.set(null);
  }

  private _extractItems(res: any): any[] {
    // soporta { items } o { data: { items } } o respuestas raras
    if (!res) return [];
    if (Array.isArray(res.items)) return res.items;
    if (res.data && Array.isArray(res.data.items)) return res.data.items;
    if (res.data && Array.isArray(res.data)) return res.data;
    return [];
  }

  private loadLinkedProducts(): void {
    const s = this.detailSupplier();
    if (!s) return;

    this.linkedLoading.set(true);
    this.linkedError.set(null);

    // Usamos tu endpoint existente: /tenant/suppliers/products?proveedor_id=...
    this._supApi.listProducts({ proveedorId: s.proveedor_id, limit: 500, offset: 0 }).subscribe({
      next: (res: any) => {
        const items = this._extractItems(res);
        // si tu backend devuelve estructura { producto: {...}, proveedores: [...] }
        // aquí tomamos producto si existe, si no tomamos el item como producto directo
        const normalized = items.map((x: any) => (x?.producto ? x.producto : x));
        this.linkedItems.set(normalized as TenantProduct[]);
      },
      error: (err) => this.linkedError.set(err?.error?.error ?? 'linked_load_failed'),
      complete: () => this.linkedLoading.set(false),
    });
  }

  // =========================
  // ✅ Modal vincular (multi-select)
  // =========================
  public openLinkModal(): void {
    const s = this.detailSupplier();
    if (!s) return;

    this.linkModalOpen.set(true);
    this.linkModalError.set(null);
    this.linkQ.set('');

    // preselecciona lo que ya está vinculado
    const current = new Set<number>((this.linkedItems() ?? []).map(p => Number((p as any).producto_id)));
    this.selectedIds.set(current);

    this.loadAllProducts();
  }

  public closeLinkModal(): void {
    this.linkModalOpen.set(false);
    this.allProducts.set([]);
    this.linkModalError.set(null);
    this.selectedIds.set(new Set<number>());
  }

  private loadAllProducts(): void {
    this.linkModalLoading.set(true);
    this.linkModalError.set(null);

    this._prodApi.list({ includeInactivos: true }).subscribe({
      next: (res: any) => this.allProducts.set((res?.items ?? []) as TenantProduct[]),
      error: (err) => this.linkModalError.set(err?.error?.error ?? 'products_load_failed'),
      complete: () => this.linkModalLoading.set(false),
    });
  }

  public isSelected(pid: number): boolean {
    return this.selectedIds().has(Number(pid));
  }

  public toggleSelected(pid: number, checked: boolean): void {
    const next = new Set(this.selectedIds());
    const id = Number(pid);
    if (checked) next.add(id);
    else next.delete(id);
    this.selectedIds.set(next);
  }

  public linkSelected(): void {
    const s = this.detailSupplier();
    if (!s) return;

    const proveedorId = Number(s.proveedor_id);
    const current = new Set<number>((this.linkedItems() ?? []).map(p => Number((p as any).producto_id)));
    const target = this.selectedIds();

    // Solo vinculamos lo nuevo
    const toAdd = [...target].filter(id => !current.has(id));
    if (toAdd.length === 0) {
      this.closeLinkModal();
      return;
    }

    this.linkModalLoading.set(true);
    this.linkModalError.set(null);

    let pending = toAdd.length;
    let failed = 0;

    toAdd.forEach(productoId => {
      this._supApi.linkProduct(proveedorId, productoId).subscribe({
        next: () => {},
        error: () => { failed++; },
        complete: () => {
          pending--;
          if (pending === 0) {
            this.linkModalLoading.set(false);
            if (failed) this.linkModalError.set('some_links_failed');
            this.closeLinkModal();
            this.loadLinkedProducts();
          }
        }
      });
    });
  }

  public unlink(productoId: number): void {
    const s = this.detailSupplier();
    if (!s) return;

    const proveedorId = Number(s.proveedor_id);
    const pid = Number(productoId);

    const before = this.linkedItems();
    this.linkedItems.set((before ?? []).filter(p => Number((p as any).producto_id) !== pid));

    this._supApi.unlinkProduct(proveedorId, pid).subscribe({
      error: (err) => {
        this.linkedItems.set(before ?? []);
        this.linkedError.set(err?.error?.error ?? 'unlink_failed');
      }
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TenantProduct } from '../../tenant-products.api';
import { Category } from '../../tenant-products.page';

@Component({
  standalone: true,
  selector: 'app-products-table',
  imports: [CommonModule],
  templateUrl: './products-table.component.html'
})
export class ProductsTableComponent {
  @Input({ required: true }) public loading = false;
  @Input({ required: true }) public categories: Category[] = [];
  @Input({ required: true }) public products: TenantProduct[] = [];

  @Input() public filterCategoriaId: number | null = null;
  @Input() public filterQ = '';
  @Input() public includeInactivos = false;

  @Output() public reload = new EventEmitter<void>();
  @Output() public filterCategoriaIdChange = new EventEmitter<number | null>();
  @Output() public filterQChange = new EventEmitter<string>();
  @Output() public includeInactivosChange = new EventEmitter<boolean>();

  @Output() public edit = new EventEmitter<TenantProduct>();
  @Output() public image = new EventEmitter<TenantProduct>();
  @Output() public remove = new EventEmitter<number>();
  @Output() public restore = new EventEmitter<number>();

  public catName(id: number): string {
    const c = this.categories.find(x => x.categoria_id === id);
    return c ? c.nombre : String(id);
  }

  public badgeClass(active: boolean): string {
    return active
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  public productImg(p: TenantProduct): string | null {
    const s = String(p.image_url || p.primary_image_url || '').trim();
    return s ? s : null;
  }

  public onClearQ(): void {
    this.filterQChange.emit('');
  }

  public toNumber(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
}

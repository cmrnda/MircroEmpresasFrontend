import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

type PosProduct = {
  producto_id: number;
  codigo: string;
  descripcion: string;
  precio: number;
  cantidad_actual?: number | null;
  primary_image_url?: string | null;
};

type PosProductsResponse = {
  items: PosProduct[];
  page: number;
  page_size: number;
  total: number;
};

@Component({
  standalone: true,
  selector: 'app-pos-catalog',
  imports: [CommonModule],
  templateUrl: './pos-catalog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosCatalogComponent {
  @Input({ required: true }) loading!: boolean;
  @Input({ required: true }) products!: PosProductsResponse;

  @Input({ required: true }) imageUrlFn!: (p: any) => string | null;
  @Input({ required: true }) fmtFn!: (n: number) => string;

  @Output() add = new EventEmitter<any>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  public canPrev(): boolean {
    return (this.products?.page ?? 1) > 1;
  }

  public canNext(): boolean {
    const d = this.products;
    if (!d) return false;
    const maxPage = Math.max(1, Math.ceil((d.total || 0) / (d.page_size || 1)));
    if ((d.items?.length ?? 0) < (d.page_size || 0)) return false;
    return (d.page || 1) < maxPage;
  }
}

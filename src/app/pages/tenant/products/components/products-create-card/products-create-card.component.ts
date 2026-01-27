import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTenantProductRequest } from '../../tenant-products.api';
import { Category } from '../../tenant-products.page';

export type ProductCreatePayload = CreateTenantProductRequest;

@Component({
  standalone: true,
  selector: 'app-products-create-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products-create-card.component.html'
})
export class ProductsCreateCardComponent {
  private readonly _fb = inject(FormBuilder);

  @Input({ required: true }) public categories: Category[] = [];
  @Input({ required: true }) public loading = false;
  @Input() public error: string | null = null;

  @Output() public create = new EventEmitter<ProductCreatePayload>();

  public readonly form = this._fb.group({
    categoria_id: [null as number | null, [Validators.required]],
    codigo: ['', [Validators.required, Validators.maxLength(60)]],
    descripcion: ['', [Validators.required, Validators.maxLength(160)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock_min: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    image_url: ['' as string | null]
  });

  public submit(): void {
    if (this.loading) return;
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    const payload: ProductCreatePayload = {
      categoria_id: Number(v.categoria_id),
      codigo: String(v.codigo || '').trim(),
      descripcion: String(v.descripcion || '').trim(),
      precio: Number(v.precio || 0),
      stock_min: Number(v.stock_min || 0),
      stock: Number(v.stock || 0),
      image_url: String(v.image_url || '').trim() ? String(v.image_url || '').trim() : null
    };

    this.create.emit(payload);

    this.form.reset(
      {
        categoria_id: v.categoria_id,
        codigo: '',
        descripcion: '',
        precio: 0,
        stock_min: 0,
        stock: 0,
        image_url: ''
      },
      { emitEvent: false }
    );
  }
}

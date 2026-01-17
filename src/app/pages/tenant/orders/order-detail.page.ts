import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TenantOrdersFacade } from './tenant-orders.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-order-detail-page',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './order-detail.page.html'
})
export class TenantOrderDetailPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _fb = inject(FormBuilder);

  public readonly vm = inject(TenantOrdersFacade);
  public readonly ventaId = signal<number>(0);

  public readonly shipForm = this._fb.group({
    tracking: ['']
  });

  public ngOnInit(): void {
    const id = Number(this._route.snapshot.paramMap.get('venta_id') || 0);
    this.ventaId.set(id);
    if (id) this.vm.loadDetail(id);
  }

  public ship(): void {
    const id = this.ventaId();
    if (!id) return;
    const t = String(this.shipForm.value.tracking || '').trim();
    this.vm.ship(id, t);
  }

  public complete(): void {
    const id = this.ventaId();
    if (!id) return;
    this.vm.complete(id);
  }
}

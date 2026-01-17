import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClientOrdersFacade } from './client-orders.facade';

@Component({
  standalone: true,
  selector: 'app-client-order-detail-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.page.html'
})
export class ClientOrderDetailPage {
  private readonly _route = inject(ActivatedRoute);
  public readonly vm = inject(ClientOrdersFacade);

  public readonly ventaId = signal<number>(0);

  public ngOnInit(): void {
    const id = Number(this._route.snapshot.paramMap.get('venta_id') || 0);
    this.ventaId.set(id);
    if (id) this.vm.loadDetail(id);
  }
}

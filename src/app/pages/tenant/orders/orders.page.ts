import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantOrdersFacade } from './tenant-orders.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-orders-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.page.html'
})
export class TenantOrdersPage {
  public readonly vm = inject(TenantOrdersFacade);

  public ngOnInit(): void {
    this.vm.load(1);
  }

  public prev(): void {
    const p = this.vm.list().page;
    if (p <= 1) return;
    this.vm.load(p - 1);
  }

  public next(): void {
    const d = this.vm.list();
    const maxPage = Math.max(1, Math.ceil(d.total / d.page_size));
    if (d.page >= maxPage) return;
    this.vm.load(d.page + 1);
  }
}

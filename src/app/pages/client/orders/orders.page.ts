import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientOrdersFacade } from './client-orders.facade';

@Component({
  standalone: true,
  selector: 'app-client-orders-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.page.html'
})
export class ClientOrdersPage {
  public readonly vm = inject(ClientOrdersFacade);

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

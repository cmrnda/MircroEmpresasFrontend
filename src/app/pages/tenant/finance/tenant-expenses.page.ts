import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TenantFinanceApi, TenantExpensesSummary } from './tenant-finance.api';

@Component({
  standalone: true,
  selector: 'app-tenant-expenses-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-expenses.page.html'
})
export class TenantExpensesPage {
  private readonly _api = inject(TenantFinanceApi);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly data = signal<TenantExpensesSummary | null>(null);

  public readonly from = signal<string>('');
  public readonly to = signal<string>('');

  public constructor() {
    this.load();
  }

  public load(): void {
    this.loading.set(true);
    this.error.set(null);

    this._api.expenses({
      from: (this.from() || '').trim() || undefined,
      to: (this.to() || '').trim() || undefined
    }).subscribe({
      next: res => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.data.set(null);
        this.loading.set(false);
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type TenantExpensesSummary = {
  empresa_id: number;
  compras_total: number;
};

@Injectable({ providedIn: 'root' })
export class TenantFinanceApi {
  public constructor(private readonly _api: ApiClientService) {}

  public expenses(opts?: { from?: string; to?: string }): Observable<TenantExpensesSummary> {
    const params: string[] = [];
    if (opts?.from) params.push(`from=${encodeURIComponent(opts.from)}`);
    if (opts?.to) params.push(`to=${encodeURIComponent(opts.to)}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._api.get<TenantExpensesSummary>(`/tenant/finance/expenses${qs}`);
  }
}

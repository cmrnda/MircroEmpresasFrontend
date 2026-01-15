import { Injectable } from '@angular/core';
import { ApiClientService } from '../core/http/api-client.service';

@Injectable({ providedIn: 'root' })
export class PlatformSubscriptionsApi {
  constructor(private api: ApiClientService) {}

  list(empresaId?: number) {
    return this.api.get<any[]>(
      empresaId
        ? `/platform/subscriptions?empresa_id=${empresaId}`
        : `/platform/subscriptions`
    );
  }

  create(data: any) {
    return this.api.post('/platform/subscriptions', data);
  }

  pay(data: any) {
    return this.api.post('/platform/subscriptions/payments', data);
  }
}

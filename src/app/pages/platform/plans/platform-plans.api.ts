import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';

export type PlatformPlan = {
  plan_id: number;
  nombre: string;
  precio: number;
  periodo_cobro: string;
};

export type ListPlatformPlansResponse = {
  items: PlatformPlan[];
};

export type CreatePlatformPlanRequest = {
  nombre: string;
  precio: number;
  periodo_cobro: string;
};

export type UpdatePlatformPlanRequest = {
  nombre?: string;
  precio?: number;
  periodo_cobro?: string;
};

@Injectable({ providedIn: 'root' })
export class PlatformPlansApi {
  public constructor(private readonly _api: ApiClientService) {}

  public list(): Observable<ListPlatformPlansResponse> {
    return this._api.get<ListPlatformPlansResponse>('/platform/plans');
  }

  public get(planId: number): Observable<PlatformPlan> {
    return this._api.get<PlatformPlan>(`/platform/plans/${planId}`);
  }

  public create(payload: CreatePlatformPlanRequest): Observable<PlatformPlan> {
    return this._api.post<PlatformPlan>('/platform/plans', payload);
  }

  public update(planId: number, payload: UpdatePlatformPlanRequest): Observable<PlatformPlan> {
    return this._api.put<PlatformPlan>(`/platform/plans/${planId}`, payload);
  }
}

import { Injectable, signal } from '@angular/core';
import { catchError, finalize, of, tap } from 'rxjs';
import { CreatePlatformPlanRequest, PlatformPlan, PlatformPlansApi, UpdatePlatformPlanRequest } from './platform-plans.api';

@Injectable({ providedIn: 'root' })
export class PlatformPlansFacade {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly items = signal<PlatformPlan[]>([]);

  public constructor(private readonly _api: PlatformPlansApi) {}

  public load() {
    this.loading.set(true);
    this.error.set(null);

    return this._api.list().pipe(
      tap(res => this.items.set(res.items ?? [])),
      catchError(err => {
        this.error.set(err?.error?.error ?? 'load_failed');
        this.items.set([]);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public create(payload: CreatePlatformPlanRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.create(payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'create_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  public update(planId: number, payload: UpdatePlatformPlanRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this._api.update(planId, payload).pipe(
      catchError(err => {
        this.error.set(err?.error?.error ?? 'update_failed');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}

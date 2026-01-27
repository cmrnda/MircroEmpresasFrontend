import { Injectable, computed, signal } from '@angular/core';
import { TenantBrandResponse } from './tenant-brand.api';

export type TenantBrandState = {
  empresa_id: number;
  empresa_nombre: string | null;
  logo_url: string | null;
  actualizado_en: string | null;
};

@Injectable({ providedIn: 'root' })
export class TenantBrandStore {
  private readonly _brand = signal<TenantBrandState | null>(null);

  public readonly empresaId = computed(() => this._brand()?.empresa_id ?? null);
  public readonly empresaNombre = computed(() => this._brand()?.empresa_nombre ?? null);
  public readonly logoUrl = computed(() => this._brand()?.logo_url ?? null);
  public readonly actualizadoEn = computed(() => this._brand()?.actualizado_en ?? null);

  public setBrand(b: TenantBrandResponse | null | undefined): void {
    if (!b) {
      this._brand.set(null);
      return;
    }

    const v: TenantBrandState = {
      empresa_id: Number(b.empresa_id || 0),
      empresa_nombre: b.empresa_nombre ?? null,
      logo_url: b.logo_url ?? null,
      actualizado_en: b.actualizado_en ?? null
    };

    this._brand.set(v);
  }

  public patchBrand(partial: Partial<TenantBrandState> | null | undefined): void {
    if (!partial) return;

    const cur = this._brand();
    const next: TenantBrandState = {
      empresa_id: Number(partial.empresa_id ?? cur?.empresa_id ?? 0),
      empresa_nombre: partial.empresa_nombre ?? cur?.empresa_nombre ?? null,
      logo_url: partial.logo_url ?? cur?.logo_url ?? null,
      actualizado_en: partial.actualizado_en ?? cur?.actualizado_en ?? null
    };

    this._brand.set(next);
  }

  public clear(): void {
    this._brand.set(null);
  }
}

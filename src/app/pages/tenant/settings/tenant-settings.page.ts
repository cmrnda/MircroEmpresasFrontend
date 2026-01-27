import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { take, tap } from 'rxjs';
import { TenantBrandApi } from '../../../shared/tenant-brand/tenant-brand.api';
import { TenantBrandStore } from '../../../shared/tenant-brand/tenant-brand.store';
import { TenantSettingsFacade } from './tenant-settings.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-settings-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenant-settings.page.html'
})
export class TenantSettingsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantSettingsFacade);
  private readonly _brandApi = inject(TenantBrandApi);
  private readonly _brandStore = inject(TenantBrandStore);

  public readonly loading = this._facade.loading;
  public readonly saving = this._facade.saving;
  public readonly error = this._facade.error;
  public readonly data = this._facade.data;

  public readonly canSave = computed(() => !this.loading() && !this.saving() && this.form.valid);

  public readonly form = this._fb.nonNullable.group({
    moneda: this._fb.nonNullable.control('BOB', [Validators.required]),
    tasa_impuesto: this._fb.nonNullable.control('0', [Validators.required]),
    logo_url: this._fb.nonNullable.control(''),
    image_url: this._fb.nonNullable.control(''),
    descripcion: this._fb.nonNullable.control('')
  });

  public constructor() {
    effect(() => {
      const d = this.data();
      if (!d) return;

      this.form.patchValue(
        {
          moneda: String(d.moneda ?? 'BOB'),
          tasa_impuesto: String(d.tasa_impuesto ?? 0),
          logo_url: String(d.logo_url ?? ''),
          image_url: String(d.image_url ?? ''),
          descripcion: String(d.descripcion ?? '')
        },
        { emitEvent: false }
      );
    });

    this.load();
  }

  public load(): void {
    this._facade.load().pipe(take(1)).subscribe();
  }

  private toNumber(v: unknown): number {
    const n = Number(String(v ?? '').trim());
    return Number.isFinite(n) ? n : 0;
  }

  private toStrOrNull(v: unknown): string | null {
    const s = String(v ?? '').trim();
    return s ? s : null;
  }

  public save(): void {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    const payload = {
      moneda: String(v.moneda || 'BOB').trim(),
      tasa_impuesto: this.toNumber(v.tasa_impuesto),
      logo_url: this.toStrOrNull(v.logo_url),
      image_url: this.toStrOrNull(v.image_url),
      descripcion: this.toStrOrNull(v.descripcion)
    };

    this._facade
      .save(payload)
      .pipe(
        take(1),
        tap(res => {
          if (!res) return;
          this._brandApi
            .getBrand()
            .pipe(
              take(1),
              tap(b => this._brandStore.setBrand(b))
            )
            .subscribe();
        })
      )
      .subscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

  public readonly loading = this._facade.loading;
  public readonly saving = this._facade.saving;
  public readonly error = this._facade.error;
  public readonly data = this._facade.data;

  public readonly canSave = computed(() => !this.loading() && !this.saving() && this.form.valid);

  public readonly form = this._fb.group({
    moneda: ['BOB', [Validators.required]],
    tasa_impuesto: ['0', [Validators.required]],
    logo_url: ['']
  });

  public constructor() {
    effect(() => {
      const d = this.data();
      if (!d) return;

      this.form.patchValue({
        moneda: String(d.moneda ?? 'BOB'),
        tasa_impuesto: String(d.tasa_impuesto ?? 0),
        logo_url: String(d.logo_url ?? '')
      });
    });

    this.load();
  }

  public load(): void {
    this._facade.load().subscribe();
  }

  private toNumber(v: unknown): number {
    const n = Number(String(v ?? '').trim());
    return Number.isFinite(n) ? n : 0;
  }

  public save(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    const payload = {
      moneda: String(v.moneda || 'BOB').trim(),
      tasa_impuesto: this.toNumber(v.tasa_impuesto),
      logo_url: String(v.logo_url || '').trim() ? String(v.logo_url).trim() : null
    };

    this._facade.save(payload).subscribe(res => {
      if (!res) return;
    });
  }
}

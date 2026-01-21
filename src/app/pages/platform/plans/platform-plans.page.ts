import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlatformPlansFacade } from './platform-plans.facade';
import { PlatformPlan } from './platform-plans.api';

@Component({
  standalone: true,
  selector: 'app-platform-plans-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './platform-plans.page.html'
})
export class PlatformPlansPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(PlatformPlansFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly filterQ = signal('');
  public readonly editOpen = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly filtered = computed(() => {
    const q = (this.filterQ() || '').trim().toLowerCase();
    const items = this.items();
    if (!q) return items;

    return items.filter(p => {
      const a = String(p.plan_id);
      const b = (p.nombre || '').toLowerCase();
      const c = (p.periodo_cobro || '').toLowerCase();
      return a.includes(q) || b.includes(q) || c.includes(q);
    });
  });

  public readonly form = this._fb.group({
    nombre: ['', Validators.required],
    precio: [0, Validators.required],
    periodo_cobro: ['', Validators.required]
  });

  public readonly editForm = this._fb.group({
    nombre: ['', Validators.required],
    precio: [0, Validators.required],
    periodo_cobro: ['', Validators.required]
  });

  public constructor() {
    this.reload();
  }

  public reload(): void {
    this._facade.load().subscribe();
  }

  public create(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    this._facade.create({
      nombre: String(v.nombre || '').trim(),
      precio: Number(v.precio),
      periodo_cobro: String(v.periodo_cobro || '').trim()
    }).subscribe(res => {
      if (!res) return;
      this.form.reset({ nombre: '', precio: 0, periodo_cobro: '' });
      this.reload();
    });
  }

  public openEdit(p: PlatformPlan): void {
    this.editingId.set(p.plan_id);

    this.editForm.patchValue({
      nombre: p.nombre,
      precio: p.precio,
      periodo_cobro: p.periodo_cobro
    });

    this.editOpen.set(true);
  }

  public closeEdit(): void {
    this.editOpen.set(false);
    this.editingId.set(null);
  }

  public saveEdit(): void {
    const id = this.editingId();
    if (!id || this.editForm.invalid) return;

    const v = this.editForm.value;

    this._facade.update(id, {
      nombre: String(v.nombre || '').trim(),
      precio: Number(v.precio),
      periodo_cobro: String(v.periodo_cobro || '').trim()
    }).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }
}

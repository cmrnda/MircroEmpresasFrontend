import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantsFacade } from './tenants.facade';
import { Empresa } from './tenants.api';

type EstadoFilter = 'ALL' | 'ACTIVA' | 'SUSPENDIDA';

@Component({
  standalone: true,
  selector: 'app-tenants-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenants.page.html'
})
export class TenantsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantsFacade);
  private readonly _router = inject(Router);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly tenants = this._facade.tenants;

  public readonly editOpen = signal(false);
  public readonly editing = signal<Empresa | null>(null);

  public readonly filterText = signal('');
  public readonly filterEstado = signal<EstadoFilter>('ALL');

  public readonly form = this._fb.group({
    nombre: ['', Validators.required],
    nit: [''],
    adminEmail: ['', [Validators.required, Validators.email]],
    adminPassword: ['', Validators.required]
  });

  public readonly editForm = this._fb.group({
    nombre: ['', Validators.required],
    nit: [''],
    estado: ['ACTIVA', Validators.required]
  });

  public constructor() {
    this.reload();
  }

  public reload(): void {
    const q = (this.filterText() || '').trim();
    const estado = this.filterEstado() === 'ALL' ? undefined : this.filterEstado();
    this._facade.load(q || undefined, estado).subscribe();
  }

  public clearFilters(): void {
    this.filterText.set('');
    this.filterEstado.set('ALL');
    this.reload();
  }

  public create(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    this._facade.create({
      nombre: v.nombre!,
      nit: v.nit || undefined,
      admin: { email: v.adminEmail!, password: v.adminPassword! }
    }).subscribe(res => {
      if (!res) return;
      this.form.reset();
      this.reload();
    });
  }

  public remove(id: number): void {
    this._facade.remove(id).subscribe(() => this.reload());
  }

  public goSubscriptions(empresaId: number): void {
    this._router.navigate(['/platform/subscriptions'], { queryParams: { empresa_id: empresaId } });
  }

  public openEdit(t: Empresa): void {
    this.editing.set(t);
    this.editForm.patchValue({
      nombre: t.nombre,
      nit: t.nit ?? '',
      estado: t.estado
    });
    this.editOpen.set(true);
  }

  public closeEdit(): void {
    this.editOpen.set(false);
    this.editing.set(null);
  }

  public saveEdit(): void {
    const t = this.editing();
    if (!t || this.editForm.invalid) return;

    const v = this.editForm.value;

    const payload = {
      nombre: v.nombre ?? undefined,
      nit: v.nit ?? undefined,
      estado: v.estado ?? undefined
    };

    this._facade.update(t.empresa_id, payload).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }

  public estadoBadgeClass(estado: string): string {
    return estado === 'ACTIVA'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-amber-50 text-amber-700';
  }
}

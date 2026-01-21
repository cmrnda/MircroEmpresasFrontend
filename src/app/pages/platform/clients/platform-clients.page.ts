import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlatformClientsFacade } from './platform-clients.facade';
import { Empresa, TenantsApi } from '../tenant/tenants.api';
import {of, switchMap} from 'rxjs';

type TenantCheck = { empresa_id: number; nombre: string; checked: boolean };

@Component({
  standalone: true,
  selector: 'app-platform-clients-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './platform-clients.page.html'
})
export class PlatformClientsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(PlatformClientsFacade);
  private readonly _tenantsApi = inject(TenantsApi);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly tenants = signal<Empresa[]>([]);
  public readonly includeInactivos = signal(false);
  public readonly filterQ = signal('');
  public readonly filterEmpresaId = signal<number | null>(null);

  public readonly editOpen = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly tenantChecks = signal<TenantCheck[]>([]);
  public readonly tenantInitialActive = signal<Record<number, boolean>>({});

  public readonly filtered = computed(() => this.items());

  public readonly form = this._fb.group({
    empresa_id: [null as number | null],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    nombre_razon: ['', Validators.required],
    nit_ci: [''],
    telefono: ['']
  });

  public readonly editForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    nombre_razon: ['', Validators.required],
    nit_ci: [''],
    telefono: [''],
    activo: [true, Validators.required]
  });

  public constructor() {
    this._tenantsApi.list().subscribe(res => {
      this.tenants.set(res.items ?? []);
      this.refreshTenantChecks();
    });

    this.reload();
  }

  private refreshTenantChecks(): void {
    const list = this.tenants();
    const initial = this.tenantInitialActive();
    const checks: TenantCheck[] = list.map(t => ({
      empresa_id: t.empresa_id,
      nombre: t.nombre,
      checked: !!initial[t.empresa_id]
    }));
    this.tenantChecks.set(checks);
  }

  public reload(): void {
    const empresaId = this.filterEmpresaId();
    const q = (this.filterQ() || '').trim() || undefined;

    this._facade
      .load({
        empresaId: empresaId ?? undefined,
        q,
        includeInactivos: this.includeInactivos()
      })
      .subscribe();
  }

  public create(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    const empresaId = v.empresa_id !== null && v.empresa_id !== undefined ? Number(v.empresa_id) : null;

    const payload: any = {
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      nombre_razon: String(v.nombre_razon || '').trim(),
      nit_ci: String(v.nit_ci || '').trim() ? String(v.nit_ci) : null,
      telefono: String(v.telefono || '').trim() ? String(v.telefono) : null
    };

    if (empresaId) payload.empresa_id = empresaId;

    this._facade.create(payload).subscribe(res => {
      if (!res) return;
      this.form.reset();
      this.reload();
    });
  }

  public openEdit(row: { cliente_id: number }): void {
    const id = row.cliente_id;
    this.editingId.set(id);
    this.error.set(null);

    this._facade.get(id).subscribe(detail => {
      if (!detail) return;

      this.editForm.patchValue({
        email: detail.email,
        nombre_razon: detail.nombre_razon,
        nit_ci: detail.nit_ci ?? '',
        telefono: detail.telefono ?? '',
        activo: !!detail.activo,
        password: ''
      });

      const mapActive: Record<number, boolean> = {};
      for (const t of detail.tenants ?? []) {
        mapActive[t.empresa_id] = !!t.activo;
      }

      this.tenantInitialActive.set(mapActive);
      this.refreshTenantChecks();

      this.editOpen.set(true);
    });
  }

  public closeEdit(): void {
    this.editOpen.set(false);
    this.editingId.set(null);
    this.tenantChecks.set([]);
    this.tenantInitialActive.set({});
  }

  public toggleTenant(empresaId: number, checked: boolean): void {
    const next = this.tenantChecks().map(t => (t.empresa_id === empresaId ? { ...t, checked } : t));
    this.tenantChecks.set(next);
  }

  public saveEdit(): void {
    const id = this.editingId();
    if (!id || this.editForm.invalid) return;

    const v = this.editForm.value;

    const payload: any = {
      email: String(v.email || '').trim(),
      nombre_razon: String(v.nombre_razon || '').trim(),
      nit_ci: String(v.nit_ci || '').trim() ? String(v.nit_ci) : null,
      telefono: String(v.telefono || '').trim() ? String(v.telefono) : null,
      activo: !!v.activo
    };

    const pass = String(v.password || '').trim();
    if (pass) payload.password = pass;

    const initial = this.tenantInitialActive();
    const current = this.tenantChecks();

    const toLink: number[] = [];
    const toUnlink: number[] = [];

    for (const t of current) {
      const was = !!initial[t.empresa_id];
      const now = !!t.checked;

      if (!was && now) toLink.push(t.empresa_id);
      if (was && !now) toUnlink.push(t.empresa_id);
    }

    this._facade
      .update(id, payload)
      .pipe(
        switchMap(updated => {
          if (!updated) return of(false);
          return this._facade.syncTenants(id, toLink, toUnlink);
        })
      )
      .subscribe(ok => {
        if (!ok) return;
        this.closeEdit();
        this.reload();
      });
  }

  public remove(id: number): void {
    this._facade.remove(id).subscribe(() => this.reload());
  }

  public restore(id: number): void {
    this._facade.restore(id).subscribe(res => {
      if (!res) return;
      this.reload();
    });
  }

  public badgeClass(activo: boolean): string {
    return activo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }
}

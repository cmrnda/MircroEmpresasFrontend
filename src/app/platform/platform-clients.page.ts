import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PlatformClientsFacade} from './platform-clients.facade';
import {Empresa, TenantsApi} from './tenants.api';

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

  public readonly filtered = computed(() => this.items());

  public readonly form = this._fb.group({
    empresa_id: [null as number | null, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    nombre_razon: ['', Validators.required],
    nit_ci: [''],
    telefono: ['']
  });

  public readonly editForm = this._fb.group({
    empresa_id: [null as number | null, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    nombre_razon: ['', Validators.required],
    nit_ci: [''],
    telefono: [''],
    activo: [true, Validators.required]
  });

  public constructor() {
    this._tenantsApi.list().subscribe(list => this.tenants.set(list));
    this.reload();
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

    this._facade
      .create({
        empresa_id: v.empresa_id!,
        email: v.email!,
        password: v.password!,
        nombre_razon: v.nombre_razon!,
        nit_ci: (v.nit_ci || '').trim() ? (v.nit_ci as string) : null,
        telefono: (v.telefono || '').trim() ? (v.telefono as string) : null
      })
      .subscribe(res => {
        if (!res) return;
        this.form.reset();
        this.reload();
      });
  }

  public openEdit(row: any): void {
    this.editingId.set(row.cliente_id);
    this.editForm.patchValue({
      empresa_id: row.empresa_id,
      email: row.email,
      nombre_razon: row.nombre_razon,
      nit_ci: row.nit_ci ?? '',
      telefono: row.telefono ?? '',
      activo: !!row.activo,
      password: ''
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
    const payload: any = {
      empresa_id: v.empresa_id!,
      email: v.email!,
      nombre_razon: v.nombre_razon!,
      nit_ci: (v.nit_ci || '').trim() ? (v.nit_ci as string) : null,
      telefono: (v.telefono || '').trim() ? (v.telefono as string) : null,
      activo: !!v.activo
    };

    if (v.password && String(v.password).trim()) payload.password = String(v.password);

    this._facade.update(id, payload).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }

  public remove(id: number): void {
    this._facade.remove(id).subscribe(() => this.reload());
  }

  public restore(id: number): void {
    this._facade.restore(id).subscribe(() => this.reload());
  }

  public badgeClass(activo: boolean): string {
    return activo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }
}

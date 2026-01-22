import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantUsersFacade } from './tenant-users.facade';
import { TenantUser } from './tenant-users.api';

type RoleKey = 'ADMIN' | 'VENDEDOR' | 'INVENTARIO';

@Component({
  standalone: true,
  selector: 'app-tenant-users-page',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './tenant-users.page.html'
})
export class TenantUsersPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantUsersFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly items = this._facade.items;

  public readonly includeInactivos = signal(false);
  public readonly filterQ = signal('');

  public readonly editOpen = signal(false);
  public readonly editingId = signal<number | null>(null);

  public readonly filtered = computed(() => this.items());

  public readonly form = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role_admin: [false],
    role_vendedor: [false],
    role_inventario: [false]
  });

  public readonly editForm = this._fb.group({
    usuario_activo: [true, Validators.required],
    membership_activo: [true, Validators.required],
    new_password: [''],
    role_admin: [false],
    role_vendedor: [false],
    role_inventario: [false]
  });

  public constructor() {
    this.reload();
  }

  public reload(): void {
    const q = (this.filterQ() || '').trim() || undefined;

    this._facade.load({
      q,
      includeInactivos: this.includeInactivos()
    }).subscribe();
  }

  private rolesFromForm(v: any): string[] {
    const roles: string[] = [];
    if (v.role_admin) roles.push('ADMIN');
    if (v.role_vendedor) roles.push('VENDEDOR');
    if (v.role_inventario) roles.push('INVENTARIO');
    return roles;
  }

  private patchRolesToForm(form: any, roles: string[]) {
    const has = (r: string) => (roles || []).includes(r);
    form.patchValue({
      role_admin: has('ADMIN'),
      role_vendedor: has('VENDEDOR'),
      role_inventario: has('INVENTARIO')
    });
  }

  public create(): void {
    if (this.form.invalid) return;

    const v = this.form.value;
    const roles = this.rolesFromForm(v);

    this._facade.create({
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      roles
    }).subscribe(res => {
      if (!res) return;
      this.form.reset({
        email: '',
        password: '',
        role_admin: false,
        role_vendedor: false,
        role_inventario: false
      });
      this.reload();
    });
  }

  public openEdit(row: TenantUser): void {
    this.editingId.set(row.usuario_id);

    this.editForm.patchValue({
      usuario_activo: !!row.activo,
      membership_activo: !!row.membership_activo,
      new_password: '',
      role_admin: false,
      role_vendedor: false,
      role_inventario: false
    });

    this.patchRolesToForm(this.editForm, row.roles || []);
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
      usuario_activo: !!v.usuario_activo,
      membership_activo: !!v.membership_activo,
      roles: this.rolesFromForm(v)
    };

    const pass = String(v.new_password || '').trim();
    if (pass) payload.new_password = pass;

    this._facade.update(id, payload).subscribe(res => {
      if (!res) return;
      this.closeEdit();
      this.reload();
    });
  }

  public disable(usuarioId: number): void {
    this._facade.disable(usuarioId).subscribe(() => this.reload());
  }

  public restore(usuarioId: number): void {
    this._facade.restore(usuarioId).subscribe(() => this.reload());
  }

  public badgeClass(activo: boolean): string {
    return activo ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';
  }
}

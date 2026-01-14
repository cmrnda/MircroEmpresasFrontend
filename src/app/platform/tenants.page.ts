import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TenantsFacade } from './tenants.facade';

@Component({
  standalone: true,
  selector: 'app-tenants-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tenants.page.html'
})
export class TenantsPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _facade = inject(TenantsFacade);

  public readonly loading = this._facade.loading;
  public readonly error = this._facade.error;
  public readonly tenants = this._facade.tenants;

  public readonly form = this._fb.group({
    nombre: ['', [Validators.required]],
    nit: [''],
    adminEmail: ['', [Validators.required, Validators.email]],
    adminPassword: ['', [Validators.required]]
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
}

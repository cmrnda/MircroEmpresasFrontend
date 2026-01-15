import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersApi, TenantUser } from './users.api';

@Component({
  standalone: true,
  selector: 'app-tenant-password-resets-page',
  imports: [CommonModule],
  templateUrl: './password-resets.page.html'
})
export class TenantPasswordResetsPage {
  private readonly _api = inject(UsersApi);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);

  public readonly query = signal('');
  public readonly users = signal<TenantUser[]>([]);
  public readonly tempPassword = signal<string | null>(null);
  public readonly lastResetUser = signal<TenantUser | null>(null);

  public readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.users();
    if (!q) return list;
    return list.filter(u => (u.email || '').toLowerCase().includes(q));
  });

  public constructor() {
    this.load();
  }

  public load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);
    this.lastResetUser.set(null);

    this._api.list().subscribe({
      next: (list) => {
        this.users.set(list ?? []);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'load_failed');
        this.loading.set(false);
      }
    });
  }

  public reset(u: TenantUser): void {
    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);
    this.lastResetUser.set(null);

    this._api.resetPassword(u.usuario_id).subscribe({
      next: (res) => {
        this.tempPassword.set(res?.temp_password ?? null);
        this.lastResetUser.set(u);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'reset_failed');
        this.loading.set(false);
      }
    });
  }

  public copyTemp(): void {
    const v = this.tempPassword();
    if (!v) return;
    const c = navigator?.clipboard;
    if (!c) return;
    c.writeText(v);
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlatformUsersApi } from './platform-users.api';

@Component({
  standalone: true,
  selector: 'app-platform-reset-password-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.page.html'
})
export class PlatformResetPasswordPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _api = inject(PlatformUsersApi);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly tempPassword = signal<string | null>(null);

  public readonly form = this._fb.group({
    usuario_id: [null as number | null, [Validators.required]]
  });

  public reset(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.tempPassword.set(null);

    const id = Number(this.form.value.usuario_id);

    this._api.resetPassword(id).subscribe({
      next: (res) => {
        this.tempPassword.set(res?.temp_password ?? null);
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

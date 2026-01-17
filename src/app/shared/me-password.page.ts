import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../core/auth/auth.api';

@Component({
  standalone: true,
  selector: 'app-me-password-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './me-password.page.html'
})
export class MePasswordPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _api = inject(AuthApi);

  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly ok = signal(false);

  public readonly form = this._fb.group({
    new_password: ['', [Validators.required, Validators.minLength(3)]]
  });

  public submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.ok.set(false);

    const v = this.form.value;

    this._api.changeMyPassword({
      new_password: String(v.new_password || '')
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.ok.set(true);
        this.form.reset();
      },
      error: (e: any) => {
        this.loading.set(false);
        this.error.set(e?.error?.error ?? 'change_failed');
      }
    });
  }
}

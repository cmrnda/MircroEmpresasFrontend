import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthApi} from '../core/auth/auth.api';

@Component({
  standalone: true,
  selector: 'app-me-password-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './me-password.page.html'
})
export class MePasswordPage {
  public readonly loading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly ok = signal(false);
  private readonly _fb = inject(FormBuilder);
  public readonly form = this._fb.group({
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]]
  });
  private readonly _api = inject(AuthApi);

  public save(): void {
    this.ok.set(false);
    this.error.set(null);

    const v = this.form.value;
    const p1 = v.new_password || '';
    const p2 = v.confirm || '';
    if (p1 !== p2) {
      this.error.set('password_mismatch');
      return;
    }

    this.loading.set(true);

    this._api.changeMyPassword(p1).subscribe({
      next: () => {
        this.ok.set(true);
        this.loading.set(false);
        this.form.reset();
      },
      error: (e) => {
        this.error.set(e?.error?.error ?? 'change_failed');
        this.loading.set(false);
      }
    });
  }
}

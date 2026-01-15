import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../core/auth/auth.facade';
import { AuthStateService } from '../core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-tenant-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './tenant-layout.component.html'
})
export class TenantLayoutComponent {
  private readonly _auth = inject(AuthFacade);
  private readonly _state = inject(AuthStateService);

  public readonly type = computed(() => this._state.claims()?.type ?? null);
  public readonly empresaId = computed(() => (this._state.claims() as any)?.empresa_id ?? null);

  public logout(): void {
    this._auth.logout();
  }
}

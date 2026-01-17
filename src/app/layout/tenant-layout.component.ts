import { Component, inject } from '@angular/core';
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

  public readonly type = this._state.type;
  public readonly empresaId = this._state.empresaId;

  public logout(): void {
    this._auth.logout();
  }
}

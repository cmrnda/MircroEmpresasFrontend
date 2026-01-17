import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, RouterOutlet} from '@angular/router';
import {AuthStateService} from '../../core/auth/auth-state.service';
import {AuthFacade} from '../../core/auth/auth.facade';

@Component({
  standalone: true,
  selector: 'app-tenant-layout',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './tenant-layout.component.html'
})
export class TenantLayoutComponent {
  private readonly _state = inject(AuthStateService);
  private readonly _auth = inject(AuthFacade);

  public readonly empresaId = this._state.empresaId;
  public readonly usuarioId = this._state.usuarioId;
  public readonly type = this._state.type;

  public logout(): void {
    this._auth.logout().subscribe();
  }
}

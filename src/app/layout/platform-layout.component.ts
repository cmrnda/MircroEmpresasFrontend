import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from '../core/auth/auth-state.service';
import { AuthFacade } from '../core/auth/auth.facade';

@Component({
  standalone: true,
  selector: 'app-platform-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './platform-layout.component.html'
})
export class PlatformLayoutComponent {
  private readonly _authState = inject(AuthStateService);
  private readonly _authFacade = inject(AuthFacade);

  public readonly type = this._authState.type;
  public readonly empresaId = this._authState.empresaId;
  public readonly usuarioId = this._authState.usuarioId;

  public logout(): void {
    this._authFacade.logout().subscribe();
  }
}

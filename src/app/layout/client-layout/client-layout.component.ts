import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthFacade } from '../../core/auth/auth.facade';
import { AuthStateService } from '../../core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './client-layout.component.html'
})
export class ClientLayoutComponent {
  private readonly _auth = inject(AuthFacade);
  private readonly _state = inject(AuthStateService);

  public readonly empresaId = this._state.empresaId;
  public readonly clienteId = this._state.clienteId;

  public logout(): void {
    this._auth.logout().subscribe();
  }
}

import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../core/auth/auth.facade';
import { AuthStateService } from '../core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-client-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './client-layout.component.html'
})
export class ClientLayoutComponent {
  private readonly _auth = inject(AuthFacade);
  private readonly _state = inject(AuthStateService);

  public readonly type = computed(() => this._state.claims()?.type ?? null);

  public logout(): void {
    this._auth.logout();
  }
}

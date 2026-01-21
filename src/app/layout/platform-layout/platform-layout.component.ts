import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthFacade } from '../../core/auth/auth.facade';
import { AuthStateService } from '../../core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-platform-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './platform-layout.component.html'
})
export class PlatformLayoutComponent {
  private readonly _authState = inject(AuthStateService);
  private readonly _authFacade = inject(AuthFacade);
  private readonly _router = inject(Router);

  public readonly type = this._authState.type;
  public readonly empresaId = this._authState.empresaId;
  public readonly usuarioId = this._authState.usuarioId;

  public readonly currentPath = computed(() => this._router.url || '');

  public readonly headerTitle = computed(() => {
    const url = this.currentPath();

    if (url.startsWith('/platform/tenants')) return 'Empresas';
    if (url.startsWith('/platform/clients')) return 'Clientes';
    if (url.startsWith('/platform/subscriptions')) return 'Suscripciones';
    if (url.startsWith('/platform/reset-password')) return 'Reset password';

    return 'Resumen de plataforma';
  });

  public constructor() {
    this._router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe();
  }

  public logout(): void {
    this._authFacade.logout().subscribe();
  }
}

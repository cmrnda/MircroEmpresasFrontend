import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthFacade } from '../../core/auth/auth.facade';
import { AuthStateService } from '../../core/auth/auth-state.service';
import { NotificationsWidgetComponent } from '../../shared/notifications/notifications-widget.component';

@Component({
  standalone: true,
  selector: 'app-tenant-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationsWidgetComponent],
  templateUrl: './tenant-layout.component.html'
})
export class TenantLayoutComponent {
  private readonly _state = inject(AuthStateService);
  private readonly _auth = inject(AuthFacade);
  private readonly _router = inject(Router);

  public readonly empresaId = this._state.empresaId;
  public readonly usuarioId = this._state.usuarioId;
  public readonly type = this._state.type;

  public readonly currentPath = computed(() => this._router.url || '');

  public readonly headerTitle = computed(() => {
    const url = this.currentPath();

    if (url.startsWith('/tenant/products')) return 'Productos';
    if (url.startsWith('/tenant/categories')) return 'Categorias';
    if (url.startsWith('/tenant/orders')) return 'Pedidos';
    if (url.startsWith('/tenant/clients')) return 'Clientes';
    if (url.startsWith('/tenant/users')) return 'Usuarios';
    if (url.startsWith('/tenant/settings')) return 'Configuraciones';

    if (url.startsWith('/tenant/suppliers')) return 'Proveedores';
    if (url.startsWith('/tenant/purchases')) return 'Compras';
    if (url.startsWith('/tenant/expenses')) return 'Gastos';
    if (url.startsWith('/tenant/pos')) return 'POS';

    return 'Resumen tenant';
  });

  public constructor() {
    this._router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  public logout(): void {
    this._auth.logout().subscribe();
  }
}

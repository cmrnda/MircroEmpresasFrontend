import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import {AuthFacade} from './core/auth/auth.facade';
import {AuthStateService} from './core/auth/auth-state.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.html'
})
export class App {
  private readonly _auth = inject(AuthFacade);
  private readonly _state = inject(AuthStateService);
  public readonly isAuth = this._state.isAuthenticated;
  public readonly isPlatform = this._state.isPlatform;
  public readonly isTenantUser = this._state.isTenantUser;
  public readonly isClient = this._state.isClient;
  private readonly _router = inject(Router);

  public type(): string {
    return this._state.claims()?.type ?? '';
  }

  public empresaId(): number | null {
    return this._state.empresaId();
  }

  public logout(): void {
    this._auth.logout().subscribe(() =>
      this._router.navigateByUrl('/login/platform')
    );
  }
}

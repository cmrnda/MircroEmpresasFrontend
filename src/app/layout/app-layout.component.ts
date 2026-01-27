import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LAYOUTS, LayoutConfig, NavItem } from './layout.data';
import {AuthFacade} from '../core/auth/auth.facade';
import {AuthStateService} from '../core/auth/auth-state.service';
import {NotificationsWidgetComponent} from '../shared/notifications/notifications-widget.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationsWidgetComponent],
  templateUrl: './app-layout.component.html'
})
export class AppLayoutComponent {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _auth = inject(AuthFacade);
  private readonly _state = inject(AuthStateService);

  public readonly type = this._state.type;
  public readonly empresaId = this._state.empresaId;
  public readonly usuarioId = this._state.usuarioId;
  public readonly clienteId = this._state.clienteId;

  public readonly hasToken = computed(() => !!this._state.token());

  private readonly _url = signal(this._router.url || '');
  private readonly _layoutKey = signal<string>('platform');

  public readonly config = computed<LayoutConfig>(() => {
    const k = this._layoutKey();
    return LAYOUTS[k] ?? LAYOUTS['platform'];
  });

  public readonly headerTitle = computed(() => {
    const cfg = this.config();
    const url = normalizeUrl(this._url());
    for (const r of cfg.titles.rules) {
      if (url.startsWith(r.prefix)) return r.title;
    }
    return cfg.titles.fallback;
  });

  public readonly navItems = computed(() => this.config().nav);

  public readonly sidebarOpen = signal(false);
  public readonly sidebarCollapsed = signal(false);

  public readonly sidebarWidthClass = computed(() => (this.sidebarCollapsed() ? 'md:w-20' : 'md:w-64'));
  public readonly mainPadClass = computed(() => (this.sidebarCollapsed() ? 'md:pl-20' : 'md:pl-64'));

  public constructor() {
    this._router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this._url.set(this._router.url || '');
        this._layoutKey.set(readLayoutKey(this._route) || 'platform');
        this.sidebarOpen.set(false);
      });

    this._layoutKey.set(readLayoutKey(this._route) || 'platform');
  }

  public logout(): void {
    this._auth.logout().subscribe();
  }

  public openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  public closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  public toggleSidebarMobile(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  public toggleSidebarDesktop(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }

  public isActive(it: NavItem): boolean {
    const url = this._router.url || '';
    const exact = !!it.exact;

    if (it.link.startsWith('/')) {
      return exact ? url === it.link : url.startsWith(it.link);
    }

    const u = normalizeUrl(url);
    const target = '/' + String(it.link).replace(/^\//, '');
    return exact ? u.endsWith(target) : u.includes(target);
  }
}

function readLayoutKey(route: ActivatedRoute): string | null {
  let r: ActivatedRoute | null = route;
  while (r?.firstChild) r = r.firstChild;
  const key = r?.snapshot?.data?.['layoutKey'];
  return typeof key === 'string' && key ? key : null;
}

function normalizeUrl(url: string): string {
  const s = String(url || '');
  const i = s.indexOf('?');
  const base = i >= 0 ? s.slice(0, i) : s;
  return base.replace(/\/+$/, '') || '/';
}

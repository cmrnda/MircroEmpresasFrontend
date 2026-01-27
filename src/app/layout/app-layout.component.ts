import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { catchError, filter, of, take, tap } from 'rxjs';
import { AuthStateService } from '../core/auth/auth-state.service';
import { LayoutConfig, LAYOUTS, NavItem } from './layout.data';
import { NotificationsWidgetComponent } from '../shared/notifications/notifications-widget.component';
import { TenantBrandApi } from '../shared/tenant-brand/tenant-brand.api';
import { TenantBrandStore } from '../shared/tenant-brand/tenant-brand.store';

type LayoutKey = keyof typeof LAYOUTS;

const DEFAULT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#0f172a"/>
<stop offset="1" stop-color="#334155"/>
</linearGradient>
</defs>
<rect width="96" height="96" rx="20" fill="url(#g)"/>
<circle cx="36" cy="40" r="10" fill="#e2e8f0"/>
<path d="M18 74c4-14 16-22 30-22s26 8 30 22" fill="#e2e8f0"/>
<path d="M62 20h14v14h-14z" fill="#94a3b8"/>
</svg>`;

const DEFAULT_LOGO_DATA_URI = `data:image/svg+xml,${encodeURIComponent(DEFAULT_LOGO_SVG)}`;

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, NotificationsWidgetComponent],
  templateUrl: './app-layout.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppLayoutComponent {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _auth = inject(AuthStateService);
  private readonly _brandApi = inject(TenantBrandApi);
  private readonly _brandStore = inject(TenantBrandStore);

  private readonly _layoutKey = signal<LayoutKey>('platform');
  private readonly _url = signal<string>(String(this._router.url || '/'));

  private readonly _sidebarOpen = signal(false);
  private readonly _sidebarCollapsed = signal(false);

  private readonly _brandLoading = signal(false);
  private readonly _brandError = signal(false);
  private readonly _logoError = signal(false);

  private _loadedEmpresaId: number | null = null;

  public readonly config = computed<LayoutConfig>(() => {
    const k = this._layoutKey();
    return (LAYOUTS[k] ?? LAYOUTS['platform']) as LayoutConfig;
  });

  public readonly navItems = computed<NavItem[]>(() => this.config().nav ?? []);

  public readonly sidebarOpen = computed(() => this._sidebarOpen());
  public readonly sidebarCollapsed = computed(() => this._sidebarCollapsed());

  public readonly sidebarWidthClass = computed(() => (this._sidebarCollapsed() ? 'md:w-20' : 'md:w-72'));
  public readonly mainPadClass = computed(() => (this._sidebarCollapsed() ? 'md:pl-20' : 'md:pl-72'));

  public readonly layoutKey = computed(() => this._layoutKey());

  public readonly empresaId = computed(() => {
    const k = this._layoutKey();

    if (k === 'tenant') {
      const n = Number(this._auth.empresaId() ?? 0);
      return Number.isFinite(n) && n > 0 ? n : null;
    }

    if (k === 'client') {
      return this.readEmpresaIdFromRoute();
    }

    return null;
  });

  public readonly brandName = computed(() => {
    const k = this._layoutKey();
    const cfg = this.config();

    if (k === 'platform') return cfg.brand.title;

    const n = this._brandStore.empresaNombre();
    if (n) return n;

    const eid = this.empresaId();
    if (eid !== null) return `Empresa ${eid}`;

    return cfg.brand.title;
  });

  public readonly brandLoading = computed(() => this._brandLoading());
  public readonly brandError = computed(() => this._brandError());

  public readonly logoSrc = computed(() => {
    if (this._logoError()) return DEFAULT_LOGO_DATA_URI;

    const k = this._layoutKey();
    const cfg = this.config();

    if (k === 'platform') {
      const p = String(cfg.brand.logoAsset || '').trim();
      return p ? p : DEFAULT_LOGO_DATA_URI;
    }

    const u = this._brandStore.logoUrl();
    if (u && !this._brandError()) return u;

    return DEFAULT_LOGO_DATA_URI;
  });

  public readonly headerTitle = computed(() => {
    const cfg = this.config();
    const url = this._url();

    const rules = cfg?.titles?.rules ?? [];
    let best: { prefix: string; title: string } | null = null;

    for (const r of rules) {
      const p = String(r.prefix || '');
      if (!p) continue;

      const hit = url.startsWith(p) || url.includes(p);
      if (!hit) continue;

      if (!best || p.length > best.prefix.length) best = { prefix: p, title: r.title };
    }

    return best?.title ?? (cfg?.titles?.fallback ?? '');
  });

  public constructor() {
    this.syncFromRoute();

    this._router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this._url.set(String(this._router.url || '/'));
      this.syncFromRoute();
      this._sidebarOpen.set(false);
      this.loadBrandIfNeeded();
    });

    effect(() => {
      this.loadBrandIfNeeded();
    });
  }

  private loadBrandIfNeeded(): void {
    const k = this._layoutKey();
    const eid = this.empresaId();

    if (k === 'platform') {
      this._loadedEmpresaId = null;
      this._brandLoading.set(false);
      this._brandError.set(false);
      this._logoError.set(false);
      this._brandStore.clear();
      return;
    }

    if (eid === null) return;

    if (this._loadedEmpresaId === eid) return;
    this._loadedEmpresaId = eid;

    this._brandLoading.set(true);
    this._brandError.set(false);
    this._logoError.set(false);

    const req$ = k === 'tenant' ? this._brandApi.getBrand() : this._brandApi.getPublicBrand(eid);

    req$
      .pipe(
        take(1),
        tap(res => {
          if (res) this._brandStore.setBrand(res);
        }),
        catchError(() => {
          this._brandError.set(true);
          return of(null);
        }),
        tap(() => this._brandLoading.set(false))
      )
      .subscribe();
  }

  private syncFromRoute(): void {
    const k = this.readLayoutKey(this._route);
    this._layoutKey.set((k ?? 'platform') as LayoutKey);
  }

  private readLayoutKey(ar: ActivatedRoute): LayoutKey | null {
    let cur: ActivatedRoute | null = ar;
    let last: LayoutKey | null = null;

    while (cur) {
      const dk = cur.snapshot?.data?.['layoutKey'];
      if (dk) last = dk as LayoutKey;
      cur = cur.firstChild ?? null;
    }

    return last;
  }

  private readEmpresaIdFromRoute(): number | null {
    let cur: ActivatedRoute | null = this._route;
    let raw: string | null = null;

    while (cur) {
      raw = cur.snapshot?.paramMap?.get('empresa_id') ?? raw;
      cur = cur.firstChild ?? null;
    }

    const n = Number(raw ?? '');
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  public hasToken(): boolean {
    return !!this._auth.token();
  }

  public toggleSidebarMobile(): void {
    this._sidebarOpen.set(!this._sidebarOpen());
  }

  public closeSidebar(): void {
    this._sidebarOpen.set(false);
  }

  public toggleSidebarDesktop(): void {
    this._sidebarCollapsed.set(!this._sidebarCollapsed());
  }

  public onLogoError(): void {
    this._logoError.set(true);
    this._brandError.set(true);
  }

  public logout(): void {
    const k = this._layoutKey() ?? 'platform';
    this._brandStore.clear();
    this._auth.clear();
    this._router.navigateByUrl(`/login/${k === 'tenant' ? 'user' : k}`);
  }
}

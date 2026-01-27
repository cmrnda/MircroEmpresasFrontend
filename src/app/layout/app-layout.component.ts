import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { interval, of, switchMap, catchError, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {NotificationDto, NotificationsApi} from '../shared/notifications/notifications.api';
import {AuthStateService} from '../core/auth/auth-state.service';

type NotifMode = 'platform' | 'tenant' | 'client';

@Component({
  standalone: true,
  selector: 'app-notifications-widget',
  imports: [CommonModule],
  templateUrl: './notifications-widget.component.html',
  styleUrls: ['./notifications-widget.component.scss']
})
export class NotificationsWidgetComponent {
  private readonly _api = inject(NotificationsApi);
  private readonly _state = inject(AuthStateService);
  private readonly _el = inject(ElementRef);
  private readonly _destroyRef = inject(DestroyRef);

  public readonly open = signal(false);
  public readonly loading = signal(false);

  public readonly unread = signal(0);
  public readonly items = signal<NotificationDto[]>([]);
  public readonly unreadOnly = signal(false);

  public readonly mode = computed<NotifMode | null>(() => {
    if (!this._state.isAuthenticated()) return null;
    if (this._state.isPlatform()) return 'platform';
    if (this._state.isTenantUser()) return 'tenant';
    if (this._state.isClient()) return 'client';
    return null;
  });

  public readonly enabled = computed(() => this.mode() !== null);

  public constructor() {
    this.loadUnreadCount()
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();

    interval(15000)
      .pipe(
        switchMap(() => (this.enabled() ? this.loadUnreadCount() : of(null))),
        catchError(() => of(null)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  public toggle(): void {
    this.open.update(v => !v);
    if (this.open()) this.refreshAll();
  }

  public close(): void {
    this.open.set(false);
  }

  public refreshAll(): void {
    if (!this.enabled()) return;

    this.loading.set(true);

    this.loadUnreadCount()
      .pipe(
        switchMap(() => this.loadList()),
        tap(() => this.loading.set(false)),
        catchError(() => {
          this.loading.set(false);
          return of(null);
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  public toggleUnreadOnly(): void {
    this.unreadOnly.update(v => !v);
    this.refreshAll();
  }

  public markRead(n: NotificationDto): void {
    if (!n || n.leido_en) return;

    const m = this.mode();
    const empresaId = this._state.empresaId();

    if (m === 'client') {
      if (empresaId == null) return;

      this._api.clientMarkRead(toInt(empresaId), toInt(n.notificacion_id))
        .pipe(
          tap(() => this.applyLocalRead(toInt(n.notificacion_id))),
          catchError(() => of(null)),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe();
      return;
    }

    if (m === 'platform') {
      this._api.platformMarkRead(toInt(n.notificacion_id))
        .pipe(
          tap(() => this.applyLocalRead(toInt(n.notificacion_id))),
          catchError(() => of(null)),
          takeUntilDestroyed(this._destroyRef)
        )
        .subscribe();
      return;
    }

    this._api.tenantMarkRead(toInt(n.notificacion_id))
      .pipe(
        tap(() => this.applyLocalRead(toInt(n.notificacion_id))),
        catchError(() => of(null)),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  public trackById(_: number, n: NotificationDto): number {
    return n.notificacion_id;
  }

  public formatDate(iso: string): string {
    try {
      const d = new Date(iso);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yy} ${hh}:${mi}`;
    } catch {
      return String(iso || '');
    }
  }

  @HostListener('document:click', ['$event'])
  public onDocClick(ev: MouseEvent): void {
    if (!this.open()) return;

    const target = ev.target as HTMLElement | null;
    if (!target) return;

    const host = this._el.nativeElement as HTMLElement;
    if (!host.contains(target)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  public onEsc(): void {
    if (this.open()) this.open.set(false);
  }

  private loadUnreadCount() {
    const m = this.mode();
    const empresaId = this._state.empresaId();

    if (m === 'client') {
      if (empresaId == null) return of(null);

      return this._api.clientUnreadCount(toInt(empresaId)).pipe(
        tap(res => this.unread.set(toInt(res?.data?.unread ?? 0))),
        catchError(() => of(null))
      );
    }

    if (m === 'platform') {
      return this._api.platformUnreadCount().pipe(
        tap(res => this.unread.set(toInt(res?.data?.unread ?? 0))),
        catchError(() => of(null))
      );
    }

    return this._api.tenantUnreadCount().pipe(
      tap(res => this.unread.set(toInt(res?.data?.unread ?? 0))),
      catchError(() => of(null))
    );
  }

  private loadList() {
    const m = this.mode();
    const empresaId = this._state.empresaId();

    const limit = 20;
    const offset = 0;
    const unreadOnly = this.unreadOnly();

    if (m === 'client') {
      if (empresaId == null) return of(null);

      return this._api.clientList(toInt(empresaId), { limit, offset, unread_only: unreadOnly }).pipe(
        tap(res => this.items.set((res?.data ?? []) as NotificationDto[])),
        catchError(() => of(null))
      );
    }

    if (m === 'platform') {
      return this._api.platformList({ limit, offset, unread_only: unreadOnly }).pipe(
        tap(res => this.items.set((res?.data ?? []) as NotificationDto[])),
        catchError(() => of(null))
      );
    }

    return this._api.tenantList({ limit, offset, unread_only: unreadOnly }).pipe(
      tap(res => this.items.set((res?.data ?? []) as NotificationDto[])),
      catchError(() => of(null))
    );
  }

  private applyLocalRead(notificacionId: number): void {
    const now = new Date().toISOString();

    if (this.unreadOnly()) {
      this.items.update(arr => arr.filter(x => x.notificacion_id !== notificacionId));
    } else {
      this.items.update(arr => arr.map(x => (x.notificacion_id === notificacionId ? { ...x, leido_en: now } : x)));
    }

    this.unread.update(v => Math.max(0, v - 1));
  }
}

function toInt(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

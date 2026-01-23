import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export type NotificationDto = {
  notificacion_id: number;
  empresa_id: number;
  actor_type: 'user' | 'client';
  usuario_id?: number | null;
  cliente_id?: number | null;
  canal: string;
  titulo: string;
  cuerpo: string;
  creado_en: string;
  leido_en?: string | null;
};

const BASE = 'http://127.0.0.1:5000';

const TENANT_BASES = [
  `${BASE}/notifications`,
  `${BASE}/tenant/notifications`,
  `${BASE}/api/notifications`
];

const PLATFORM_BASES = [
  `${BASE}/platform/notifications`,
  `${BASE}/platform/api/notifications`
];

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly _http = inject(HttpClient);

  private firstGet<T>(urls: string[]): Observable<T> {
    return this._http.get<T>(urls[0]).pipe(
      catchError(err1 => {
        if (err1?.status !== 404 || urls.length < 2) return throwError(() => err1);
        return this._http.get<T>(urls[1]).pipe(
          catchError(err2 => {
            if (err2?.status !== 404 || urls.length < 3) return throwError(() => err2);
            return this._http.get<T>(urls[2]);
          })
        );
      })
    );
  }

  private firstPost<T>(urls: string[], body: any): Observable<T> {
    return this._http.post<T>(urls[0], body).pipe(
      catchError(err1 => {
        if (err1?.status !== 404 || urls.length < 2) return throwError(() => err1);
        return this._http.post<T>(urls[1], body).pipe(
          catchError(err2 => {
            if (err2?.status !== 404 || urls.length < 3) return throwError(() => err2);
            return this._http.post<T>(urls[2], body);
          })
        );
      })
    );
  }

  public tenantUnreadCount() {
    const urls = TENANT_BASES.map(b => `${b}/unread-count`);
    return this.firstGet<{ data: { unread: number } }>(urls);
  }

  public tenantList(params: { limit: number; offset: number; unread_only: boolean }) {
    const u = params.unread_only ? '1' : '0';
    const urls = TENANT_BASES.map(b => `${b}/?limit=${params.limit}&offset=${params.offset}&unread_only=${u}`);
    return this.firstGet<{ data: NotificationDto[] }>(urls);
  }

  public tenantMarkRead(notificacionId: number) {
    const urls = TENANT_BASES.map(b => `${b}/${notificacionId}/read`);
    return this.firstPost<{ data: NotificationDto }>(urls, {});
  }

  public platformUnreadCount() {
    const urls = PLATFORM_BASES.map(b => `${b}/unread-count`);
    return this.firstGet<{ data: { unread: number } }>(urls);
  }

  public platformList(params: { limit: number; offset: number; unread_only: boolean }) {
    const u = params.unread_only ? '1' : '0';
    const urls = PLATFORM_BASES.map(b => `${b}/?limit=${params.limit}&offset=${params.offset}&unread_only=${u}`);
    return this.firstGet<{ data: NotificationDto[] }>(urls);
  }

  public platformMarkRead(notificacionId: number) {
    const urls = PLATFORM_BASES.map(b => `${b}/${notificacionId}/read`);
    return this.firstPost<{ data: NotificationDto }>(urls, {});
  }

  public clientUnreadCount(empresaId: number) {
    return this._http.get<{ data: { unread: number } }>(`${BASE}/shop/${empresaId}/notifications/unread-count`);
  }

  public clientList(empresaId: number, params: { limit: number; offset: number; unread_only: boolean }) {
    const u = params.unread_only ? '1' : '0';
    return this._http.get<{ data: NotificationDto[] }>(
      `${BASE}/shop/${empresaId}/notifications?limit=${params.limit}&offset=${params.offset}&unread_only=${u}`
    );
  }

  public clientMarkRead(empresaId: number, notificacionId: number) {
    return this._http.post<{ data: NotificationDto }>(`${BASE}/shop/${empresaId}/notifications/${notificacionId}/read`, {});
  }
}

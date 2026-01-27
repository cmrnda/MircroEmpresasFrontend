import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

const TENANT_BASE = `${BASE}/api/notifications`;
const PLATFORM_BASE = `${BASE}/platform/api/notifications`;

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly _http = inject(HttpClient);

  public tenantUnreadCount() {
    return this._http.get<{ data: { unread: number } }>(`${TENANT_BASE}/unread-count`);
  }

  public tenantList(params: { limit: number; offset: number; unread_only: boolean }) {
    const u = params.unread_only ? '1' : '0';
    return this._http.get<{ data: NotificationDto[] }>(
      `${TENANT_BASE}/?limit=${params.limit}&offset=${params.offset}&unread_only=${u}`
    );
  }

  public tenantMarkRead(notificacionId: number) {
    return this._http.post<{ data: NotificationDto }>(`${TENANT_BASE}/${notificacionId}/read`, {});
  }

  public platformUnreadCount() {
    return this._http.get<{ data: { unread: number } }>(`${PLATFORM_BASE}/unread-count`);
  }

  public platformList(params: { limit: number; offset: number; unread_only: boolean }) {
    const u = params.unread_only ? '1' : '0';
    return this._http.get<{ data: NotificationDto[] }>(
      `${PLATFORM_BASE}/?limit=${params.limit}&offset=${params.offset}&unread_only=${u}`
    );
  }

  public platformMarkRead(notificacionId: number) {
    return this._http.post<{ data: NotificationDto }>(`${PLATFORM_BASE}/${notificacionId}/read`, {});
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
    return this._http.post<{ data: NotificationDto }>(
      `${BASE}/shop/${empresaId}/notifications/${notificacionId}/read`,
      {}
    );
  }
}

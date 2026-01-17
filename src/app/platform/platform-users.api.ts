import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../core/http/api-client.service';

@Injectable({ providedIn: 'root' })
export class PlatformUsersApi {
  public constructor(private readonly _api: ApiClientService) {}

  public resetPassword(usuarioId: number): Observable<any> {
    return this._api.post<any>(`/platform/users/${usuarioId}/reset-password`, {});
  }
}

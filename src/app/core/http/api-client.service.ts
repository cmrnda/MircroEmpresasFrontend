import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly _base = environment.apiBaseUrl;

  public constructor(private readonly _http: HttpClient) {}

  public get<T>(path: string, headers?: Record<string, string>): Observable<T> {
    return this._http.get<T>(this._base + path, { headers: new HttpHeaders(headers ?? {}) });
  }

  public post<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this._http.post<T>(this._base + path, body, { headers: new HttpHeaders(headers ?? {}) });
  }

  public put<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this._http.put<T>(this._base + path, body, { headers: new HttpHeaders(headers ?? {}) });
  }

  public patch<T>(path: string, body: unknown, headers?: Record<string, string>): Observable<T> {
    return this._http.patch<T>(this._base + path, body, { headers: new HttpHeaders(headers ?? {}) });
  }

  public delete<T>(path: string, headers?: Record<string, string>): Observable<T> {
    return this._http.delete<T>(this._base + path, { headers: new HttpHeaders(headers ?? {}) });
  }
}

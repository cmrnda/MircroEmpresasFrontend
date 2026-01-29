import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type HeadersDict = Record<string, string>;
type QueryDict = Record<string, string | number | boolean | null | undefined>;

function trimSlashEnd(s: string): string {
  return s.replace(/\/+$/, '');
}

function resolveApiBaseUrl(): string {
  const fromEnv = (environment.apiBaseUrl || '').trim();
  if (fromEnv) return trimSlashEnd(fromEnv);

  const host = window.location.hostname || 'localhost';
  const proto = window.location.protocol === 'https:' ? 'https' : 'http';
  return `${proto}://${host}:5000`;
}

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly _base = resolveApiBaseUrl();

  public constructor(private readonly _http: HttpClient) {}

  private _headers(headers?: HeadersDict): HttpHeaders {
    return new HttpHeaders(headers ?? {});
  }

  private _params(query?: QueryDict): HttpParams | undefined {
    if (!query) return undefined;
    let p = new HttpParams();
    for (const k of Object.keys(query)) {
      const v = query[k];
      if (v === null || v === undefined) continue;
      p = p.set(k, String(v));
    }
    return p;
  }

  public get<T>(path: string, opts?: { headers?: HeadersDict; query?: QueryDict }): Observable<T> {
    return this._http.get<T>(this._base + path, {
      headers: this._headers(opts?.headers),
      params: this._params(opts?.query)
    });
  }

  public post<T>(path: string, body: unknown, opts?: { headers?: HeadersDict; query?: QueryDict }): Observable<T> {
    return this._http.post<T>(this._base + path, body, {
      headers: this._headers(opts?.headers),
      params: this._params(opts?.query)
    });
  }

  public put<T>(path: string, body: unknown, opts?: { headers?: HeadersDict; query?: QueryDict }): Observable<T> {
    return this._http.put<T>(this._base + path, body, {
      headers: this._headers(opts?.headers),
      params: this._params(opts?.query)
    });
  }

  public patch<T>(path: string, body: unknown, opts?: { headers?: HeadersDict; query?: QueryDict }): Observable<T> {
    return this._http.patch<T>(this._base + path, body, {
      headers: this._headers(opts?.headers),
      params: this._params(opts?.query)
    });
  }

  public delete<T>(path: string, opts?: { headers?: HeadersDict; query?: QueryDict }): Observable<T> {
    return this._http.delete<T>(this._base + path, {
      headers: this._headers(opts?.headers),
      params: this._params(opts?.query)
    });
  }

  public getBlob(path: string, opts?: { headers?: HeadersDict; query?: QueryDict }): Observable<Blob> {
    return this._http.get(this._base + path, {
      headers: this._headers(opts?.headers),
      params: this._params(opts?.query),
      responseType: 'blob'
    });
  }
}

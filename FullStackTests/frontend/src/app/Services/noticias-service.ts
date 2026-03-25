import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiNoticias } from '../interfaces/api-noticias';
import { noticiasUrl } from '../../ExternalRouting/backendRoutes';

@Injectable({
  providedIn: 'root',
})
export class NoticiasService {
  private httpClient = inject(HttpClient);

  getAllNews(from?: string, to?: string): Observable<ApiNoticias> {
    const params: Record<string, string> = {};

    if (from) params['from'] = from;
    if (to) params['to'] = to;

    return this.httpClient.get<ApiNoticias>(noticiasUrl, { params });
  }
}

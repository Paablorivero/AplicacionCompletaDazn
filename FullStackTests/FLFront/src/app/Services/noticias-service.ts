import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiNoticias } from '../interfaces/api-noticias';

@Injectable({
  providedIn: 'root',
})
export class NoticiasService {
  private baseUrl = 'https://newsapi.org/v2/everything';
  private apiKey = 'f529abbf0c5742389196a2f0e8128883';

  private httpClient = inject(HttpClient);

  getAllNews(from?: string, to?: string): Observable<ApiNoticias> {
    const params: Record<string, string> = {
      q: 'fútbol',
      language: 'es',
      sortBy: 'publishedAt',
      page: '1',
      pageSize: '100',
      apiKey: this.apiKey,
    };

    if (from) params['from'] = from;
    if (to) params['to'] = to;

    return this.httpClient.get<ApiNoticias>(this.baseUrl, { params });
  }
}

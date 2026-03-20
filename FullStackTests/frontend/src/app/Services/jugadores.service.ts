import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { jugadoresUrl } from '../../ExternalRouting/backendRoutes';
import { JugadorListItem } from '../interfaces/dtos/jugador-list-item.interface';

@Injectable({
  providedIn: 'root',
})
export class JugadoresService {
  private http = inject(HttpClient);

  getAllJugadores(ligaId?: string): Promise<JugadorListItem[]> {
    const params = ligaId ? new HttpParams().set('ligaId', ligaId) : undefined;
    return lastValueFrom(this.http.get<JugadorListItem[]>(jugadoresUrl, { params }));
  }
}

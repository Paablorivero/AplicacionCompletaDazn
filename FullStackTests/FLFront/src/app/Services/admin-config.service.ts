import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { adminTemporadasUrl, jugadoresUrl } from '../../ExternalRouting/backendRoutes';
import { AdminJugadorListItem } from '../interfaces/dtos/admin-jugador-list-item.interface';

export interface EstadoJornadaAdminResponse {
  ok: boolean;
  jornadaActual: number;
  jornadaIniciada: boolean;
  maxJornada: number;
}

interface OperacionJornadaResponse {
  ok: boolean;
  jornadaActual: number;
  jornadaIniciada: boolean;
  jugadoresActualizados?: number;
}

interface ActualizarMercadoResponse {
  ok: boolean;
  jugadoresActualizados: number;
}

export interface AdminJornadaItem {
  jornadaId: number;
  fInicio: string | null;
  fFin: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminConfigService {
  private http = inject(HttpClient);

  estadoJornada(): Promise<EstadoJornadaAdminResponse> {
    return lastValueFrom(
      this.http.get<EstadoJornadaAdminResponse>(`${adminTemporadasUrl}/jornada/estado`)
    );
  }

  iniciarJornada(): Promise<OperacionJornadaResponse> {
    return lastValueFrom(
      this.http.post<OperacionJornadaResponse>(`${adminTemporadasUrl}/jornada/iniciar`, {
        fechaEvento: new Date().toISOString()
      })
    );
  }

  finalizarJornada(): Promise<OperacionJornadaResponse> {
    return lastValueFrom(
      this.http.post<OperacionJornadaResponse>(`${adminTemporadasUrl}/jornada/finalizar`, {
        fechaEvento: new Date().toISOString()
      })
    );
  }

  getJugadores(): Promise<AdminJugadorListItem[]> {
    return lastValueFrom(
      this.http.get<AdminJugadorListItem[]>(jugadoresUrl)
    );
  }

  getJornadas(): Promise<AdminJornadaItem[]> {
    return lastValueFrom(
      this.http.get<AdminJornadaItem[]>(`${adminTemporadasUrl}/jornada/historial`)
    ).catch((error: HttpErrorResponse) => {
      // Si el backend aún no está reiniciado y no expone la ruta nueva, evitamos romper la UI.
      if (error.status === 404) {
        return [];
      }
      throw error;
    });
  }

  actualizarMercado(): Promise<ActualizarMercadoResponse> {
    return lastValueFrom(
      this.http.post<ActualizarMercadoResponse>(`${adminTemporadasUrl}/actualizar-mercado`, {})
    );
  }
}

import {inject, Injectable} from '@angular/core';
import { alineacionesUrl, plantillasUrl } from '../../ExternalRouting/backendRoutes';
import {HttpClient} from '@angular/common/http';
import {JugadorResumenDto} from '../interfaces/dtos/jugadorresumendto';
import {lastValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlineacionesService {

//   Inyecto el HttpClient
  private http = inject(HttpClient);

//   Metodo que obtiene la alineación de un equipo actual
  getAlineacion(equipoId: string, jornadaId: number): Promise<JugadorResumenDto[]> {
    return lastValueFrom(this.http.get<JugadorResumenDto[]>(`${alineacionesUrl}/actual/${equipoId}/${jornadaId}`));
  }

//   Metodo para actualizar la plantilla de un equipo
  actualizarAlineacion(equipoId: string, jornadaId: number, jugadores: number[]){
    return lastValueFrom(this.http.put(`${alineacionesUrl}/${equipoId}/${jornadaId}`, {jugadores}));
  }

  getPlantillaActiva(equipoId: string): Promise<JugadorResumenDto[]> {
    return lastValueFrom(this.http.get<JugadorResumenDto[]>(`${plantillasUrl}/activa/${equipoId}`));
  }

//   Metodo para obtener la plantilla completa de un equipo para una jornada concreta
  getPlantillaJornada(equipoId: string, jornadaId: number): Promise<JugadorResumenDto[]> {
    return lastValueFrom(this.http.get<JugadorResumenDto[]>(`${plantillasUrl}/actual/${equipoId}/${jornadaId}`));
  }
}

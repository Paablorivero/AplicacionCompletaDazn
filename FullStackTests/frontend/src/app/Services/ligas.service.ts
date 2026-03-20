import {inject, Injectable} from '@angular/core';
import {ligasUrl} from '../../ExternalRouting/backendRoutes';
import {HttpClient} from '@angular/common/http';
import {Liga} from '../interfaces/liga.interface';
import {lastValueFrom, timeout} from 'rxjs';
import {LigaClasificacion} from '../Pages/liga-clasificacion/liga-clasificacion';
import {Ligaclasificaciondto} from '../interfaces/dtos/ligaclasificaciondto.interface';
import {LigaEquiposUsuarioDto} from '../interfaces/dtos/ligaequiposusuariodto.interface';
import {Equipo} from '../interfaces/equipo.interface';
import {MercadoJugadorDto} from '../interfaces/dtos/mercadojugadordto.interface';

@Injectable({
  providedIn: 'root',
})
export class LigasService {

//   Después de importar la url correspondiente a las ligas inyecto httpclient
  private http = inject(HttpClient);
  private mercadoCache = new Map<string, MercadoJugadorDto[]>();
  private mercadoVersionCache = new Map<string, number>();

//   Creo el método que permite crear una liga

  postLiga(nombreLiga: string, nombreEquipo: string): Promise<void>{
    // Creo el objeto que necesito mandar
    const data = {nombreLiga: nombreLiga, nombreEquipo: nombreEquipo}

    return lastValueFrom(this.http.post<void>(`${ligasUrl}`, data));
  }

  //Creo el método que nos permite unirnos a una liga
  unirseLiga(ligaId: string, nombreEquipo: string): Promise<Equipo>{

    return lastValueFrom(this.http.post<Equipo>(`${ligasUrl}/unirse/${ligaId}`, {nombreEquipo}));
  }

// Creo el método que me devuelve todas las ligas
  getAllLigas(): Promise<Liga[]> {
    return lastValueFrom(this.http.get<Liga[]>(`${ligasUrl}/all`));
  }

//   Creo el método que nos muestra las ligas que todavía tienen plazas disponibles
  getLigasPlazasLibres(): Promise<Liga[]>{
    return lastValueFrom(this.http.get<Liga[]>(`${ligasUrl}/disponibles`));
  }

//   Creo el método que nos permite obtener la clasificación de una liga
  getClasificacionLiga(ligaId: string): Promise<Ligaclasificaciondto[]>{
    return lastValueFrom(this.http.get<Ligaclasificaciondto[]>(`${ligasUrl}/${ligaId}/clasificacion`));
  }

//   Método que devuelve los equipos participantes de una liga y su nombre de usuarios
  getParticipantesLiga(ligaId: string): Promise<LigaEquiposUsuarioDto>{
    return lastValueFrom(this.http.get<LigaEquiposUsuarioDto>(`${ligasUrl}/${ligaId}/participantes`));
  }

  getMercadoLiga(ligaId: string, limit: number = 20): Promise<MercadoJugadorDto[]>{
    return lastValueFrom(this.http.get<MercadoJugadorDto[]>(`${ligasUrl}/${ligaId}/mercado?limit=${limit}`));
  }

  getMercadoVersion(ligaId: string): Promise<number> {
    return lastValueFrom(
      this.http.get<{ ok: boolean; version: number }>(`${ligasUrl}/${ligaId}/mercado/version`)
    ).then((response) => response.version);
  }

  async getMercadoLigaCached(ligaId: string, limit: number = 20, forceReload: boolean = false): Promise<MercadoJugadorDto[]> {
    const versionRemota = await this.getMercadoVersion(ligaId);
    const versionLocal = this.mercadoVersionCache.get(ligaId);
    const versionDesactualizada = versionLocal !== undefined && versionLocal !== versionRemota;

    if (versionDesactualizada) {
      this.mercadoCache.delete(ligaId);
    }

    if (!forceReload && this.mercadoCache.has(ligaId)) {
      return this.mercadoCache.get(ligaId)!;
    }

    const jugadores = await this.getMercadoLiga(ligaId, limit);
    this.mercadoCache.set(ligaId, jugadores);
    this.mercadoVersionCache.set(ligaId, versionRemota);
    return jugadores;
  }

  removeJugadorMercadoCache(ligaId: string, jugadorId: number): void {
    const actuales = this.mercadoCache.get(ligaId) ?? [];
    this.mercadoCache.set(ligaId, actuales.filter((j) => j.jugadorId !== jugadorId));
  }

  clearMercadoCache(ligaId?: string): void {
    if (!ligaId) {
      this.mercadoCache.clear();
      this.mercadoVersionCache.clear();
      return;
    }
    this.mercadoCache.delete(ligaId);
    this.mercadoVersionCache.delete(ligaId);
  }

  comprarJugadorMercado(ligaId: string, jugadorId: number): Promise<{ ok: boolean; presupuestoRestante: number }>{
    return lastValueFrom(this.http.post<{ ok: boolean; presupuestoRestante: number }>(
      `${ligasUrl}/${ligaId}/mercado/comprar`,
      { jugadorId }
    ));
  }

  venderJugadorMercado(ligaId: string, jugadorId: number, jornadaId?: number): Promise<{
    ok: boolean;
    jugadorId: number;
    jugadorNombre: string;
    ingresoVenta: number;
    presupuestoRestante: number;
  }>{
    return lastValueFrom(
      this.http.post<{
        ok: boolean;
        jugadorId: number;
        jugadorNombre: string;
        ingresoVenta: number;
        presupuestoRestante: number;
      }>(
        `${ligasUrl}/${ligaId}/mercado/vender`,
        { jugadorId, jornadaId }
      ).pipe(timeout(12000))
    );
  }
}

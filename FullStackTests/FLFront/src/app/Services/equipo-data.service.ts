import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { equiposUrl } from '../../ExternalRouting/backendRoutes';
import { Equipo } from '../interfaces/equipo.interface';
import { EquipoligaService } from './equipoliga.service';

@Injectable({
  providedIn: 'root',
})
export class EquipoDataService {
  private readonly http = inject(HttpClient);
  private readonly equipoLigaService = inject(EquipoligaService);

  equipoActual = signal<Equipo | null>(null);
  cargando = signal(false);
  error = signal('');
  ligaCargada = signal<string | null>(null);

  resetEstado(): void {
    this.equipoActual.set(null);
    this.cargando.set(false);
    this.error.set('');
    this.ligaCargada.set(null);
  }

  async cargarEquipoEnLiga(ligaId: string): Promise<Equipo | null> {
    if (this.ligaCargada() === ligaId && this.equipoActual()) {
      return this.equipoActual();
    }

    this.cargando.set(true);
    this.error.set('');

    try {
      const equipo = await lastValueFrom(this.http.get<Equipo>(`${equiposUrl}/mio/${ligaId}`));
      this.equipoActual.set(equipo);
      this.ligaCargada.set(ligaId);
      this.equipoLigaService.setEquipo(equipo);
      return equipo;
    } catch (e) {
      this.equipoActual.set(null);
      this.ligaCargada.set(null);
      if (e instanceof HttpErrorResponse && e.error?.error) {
        this.error.set(e.error.error);
      } else {
        this.error.set('No se pudo cargar el equipo de la liga.');
      }
      return null;
    } finally {
      this.cargando.set(false);
    }
  }
}

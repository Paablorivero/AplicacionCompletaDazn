import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ControljornadasService} from './controljornadas.service';
import {lastValueFrom} from 'rxjs';
import {TemporadaInterface} from '../interfaces/temporada.interface';
import {temporadasUrl} from '../../ExternalRouting/backendRoutes';

@Injectable({
  providedIn: 'root',
})
export class TemporadaService {

  // Servicio http
  http = inject(HttpClient);

  //Para actualizar la jornada actual y la jornada seleccionada al inicio necesito injectar el servicio
  controJorn = inject(ControljornadasService);

  constructor(){
  //   Llamo al endpoint mediante una función
    void this.obtenerJornadaActual();
  }


  async obtenerJornadaActual() {
    try {
      // Se obtiene siempre la temporada activa real para evitar depender de IDs fijos.
      const temporada = await lastValueFrom(this.http.get<TemporadaInterface>(`${temporadasUrl}/actual`));
      this.controJorn.setJornadaActiva(temporada.jornadaActual);
      this.controJorn.setJornadaSeleccionada(temporada.jornadaActual);
    } catch {
      // Fallback seguro para no dejar la app en estado no inicializado.
      this.controJorn.setJornadaActiva(1);
      this.controJorn.setJornadaSeleccionada(1);
    }
  }
}

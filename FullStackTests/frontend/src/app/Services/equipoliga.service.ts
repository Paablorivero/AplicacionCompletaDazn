import {Injectable, signal} from '@angular/core';
import {Liga} from '../interfaces/liga.interface';
import {Equipo} from '../interfaces/equipo.interface';

@Injectable({
  providedIn: 'root',
})
export class EquipoligaService {

  //Este signal se actualizará con la id de una liga seleccionada por el jugador
  ligaSeleccionada = signal<Liga | null>(null);

  // Este signal se actualizara con la id de un equipo seleccionado por el jugador
  equipoSeleccionado = signal<Equipo | null>(null);

  constructor() {
    this.actualizarDatos();
  }

//   Metodo para actualizar el valor del signal de liga
  setLiga(liga: Liga) {
    this.ligaSeleccionada.set(liga);
    localStorage.setItem('liga', JSON.stringify(liga));
  }

//   Metodo para actualizar el valor del signal de equipo
  setEquipo(equipo: Equipo) {
    this.equipoSeleccionado.set(equipo);
    localStorage.setItem('equipo', JSON.stringify(equipo));
  }

  clearSeleccion(): void {
    this.ligaSeleccionada.set(null);
    this.equipoSeleccionado.set(null);
    localStorage.removeItem('liga');
    localStorage.removeItem('equipo');
  }

  private actualizarDatos() {
    const equipoSalvado = localStorage.getItem('equipo');
    const ligaSalvada = localStorage.getItem('liga');

    if(ligaSalvada){
      this.setLiga(JSON.parse(ligaSalvada));
    }

    if(equipoSalvado){
      this.setEquipo(JSON.parse(equipoSalvado));
    }
  }
}

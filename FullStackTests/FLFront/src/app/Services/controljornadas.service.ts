import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ControljornadasService {

//   Defino un signal para jornada activa de la liga
  jornadaActiva = signal<number | null>(null);

//   Defino un signal para la jornada que quiere ver el usuario
  jornadaSeleccionada = signal<number | null>(null);

//   Métodos para actualizar los signals

  constructor(){
    //Llamo a un método que hará una petición para saber el valor de la jornada Activa. Esto solo se hará al arrancar la app
    this.obtenerJornadaActiva();
  }

  setJornadaActiva(jornada: number) {
    this.jornadaActiva.set(jornada);
  }

  setJornadaSeleccionada(jornada: number) {
    this.jornadaSeleccionada.set(jornada);
  }



  async obtenerJornadaActiva(){
  //   Ya generaré el código cuando tenga el servicio para obtener las jornadas.
  }
}

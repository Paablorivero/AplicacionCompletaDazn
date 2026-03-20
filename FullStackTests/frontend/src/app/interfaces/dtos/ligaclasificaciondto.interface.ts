// Este es el dto para la clasificación de una liga. Eso si, hay que acordarse que el endpoint
// devulve un array, a la hora de trabajar la petición.

export interface Ligaclasificaciondto {
  liga_id: string;
  equipo_id: string;
  nombre_equipo: string;
  puntos: string;
}

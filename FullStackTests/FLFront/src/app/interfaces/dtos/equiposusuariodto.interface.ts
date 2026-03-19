// Interface preparada para recibir una respues concreta del back, en este caso, el listado de
// Equipos y ligas en las que participan propiedad de un usuario.

export interface Equiposusuariodto {
  username: string;
  Equipos: {
    equipoId: string;
    nombre: string;
    ligaId: string;
    Liga: {
      ligaId: string;
      nombreLiga: string;
    };
  }[];
}

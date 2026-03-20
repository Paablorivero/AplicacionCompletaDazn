export interface JugadorListItem {
  jugadorId: number;
  nombre: string;
  firstName: string | null;
  lastName: string | null;
  fechaNacimiento: string | null;
  nacionalidad: string | null;
  lesionado: boolean;
  foto: string | null;
  equipoProfesionalId: number | null;
  posicion: string | null;
  valor: number;
  equipoProfesionalNombre: string;
  equipoProfesionalLogo: string | null;
  tieneEquipoProfesional: boolean;
  tieneEquipoEnLiga: boolean;
  equipoLigaNombre: string | null;
}
